import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class EmpresasService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private auditService: AuditService,
  ) {}

  async create(createEmpresaDto: any, usuarioId: string) {
    const ruc = String(createEmpresaDto.ruc || '').trim();
    const razonSocial = String(createEmpresaDto.razonSocial || '').trim();
    const usuarioSol = String(createEmpresaDto.usuarioSol || '').trim();
    const claveSol = String(createEmpresaDto.claveSol || '').trim();
    const habilitadoSunat = createEmpresaDto.habilitadoSunat !== undefined ? Boolean(createEmpresaDto.habilitadoSunat) : true;
    const habilitadoSunafil = createEmpresaDto.habilitadoSunafil !== undefined ? Boolean(createEmpresaDto.habilitadoSunafil) : false;

    if (!ruc || !razonSocial || !usuarioSol || !claveSol) {
      throw new BadRequestException(
        'Todos los campos (RUC, Razón Social, Usuario SOL y Clave SOL) son obligatorios.',
      );
    }

    const existing = await this.prisma.empresa.findFirst({
      where: { ruc, usuarioId },
    });

    if (existing) {
      // Si la empresa ya existe, actualizar sus flags de entidad sin dar error
      const updateData: any = {};
      if (createEmpresaDto.habilitadoSunat !== undefined) updateData.habilitadoSunat = habilitadoSunat;
      if (createEmpresaDto.habilitadoSunafil !== undefined) updateData.habilitadoSunafil = habilitadoSunafil;
      if (usuarioSol) updateData.usuarioSol = usuarioSol;
      if (claveSol) updateData.claveSol = this.encryptionService.encrypt(claveSol);

      await this.prisma.empresa.update({
        where: { id: existing.id },
        data: updateData,
      });

      return { ...existing, ...updateData };
    }

    const claveEncriptada = this.encryptionService.encrypt(claveSol);
    const nuevaEmpresa = await this.prisma.empresa.create({
      data: {
        ruc,
        razonSocial,
        usuarioSol,
        claveSol: claveEncriptada,
        habilitadoSunat,
        habilitadoSunafil,
        usuarioId: usuarioId,
      },
    });

    await this.auditService.log({
      usuarioId,
      accion: 'CREAR_EMPRESA',
      entidad: 'Empresa',
      entidadId: nuevaEmpresa.id,
      detalles: { ruc, razonSocial, usuarioSol, habilitadoSunat, habilitadoSunafil },
    });

    return nuevaEmpresa;
  }

  async findAllByUser(usuarioId: string, userRol: string) {
    const anoActual = new Date().getFullYear();
    const inicioAnio = new Date(`${anoActual}-01-01T00:00:00.000Z`);
    const finAnio = new Date(`${anoActual}-12-31T23:59:59.999Z`);

    // ADMIN y SUPER_ADMIN ven TODAS las empresas del sistema
    if (userRol === 'SUPER_ADMIN' || userRol === 'ADMIN') {
      const whereClause = {};

      const empresas = await this.prisma.empresa.findMany({
        where: whereClause,
        select: {
          id: true,
          ruc: true,
          razonSocial: true,
          usuarioSol: true,
          claveSol: true,
          habilitadoSunat: true,
          habilitadoSunafil: true,
          terminosSunafil: true,
          estadoConexion: true,
          estadoSincro: true,
          activo: true,
          ultimaSincronizacion: true,
          createdAt: true,
          _count: {
            select: {
              notificaciones: {
                where: { fechaMensaje: { gte: inicioAnio, lte: finAnio } },
              },
            },
          },
          asignaciones: {
            include: {
              usuario: {
                select: { id: true, nombres: true, apellidos: true, dni: true, email: true },
              },
            },
          },
        },
        orderBy: { razonSocial: 'asc' },
      });

      // Seguridad: Enmascarar la clave SOL en listados generales para evitar exposición masiva
      return empresas.map((emp: any) => ({
        ...emp,
        claveSol: '••••••••',
      }));
    }

    // Usuarios secundarios: solo ven sus empresas asignadas
    const asignaciones = await this.prisma.empresaAsignacion.findMany({
      where: { usuarioId },
      select: { empresaId: true },
    });
    const empresaIds = asignaciones.map((a: any) => a.empresaId);
    if (empresaIds.length === 0) return [];

    return this.prisma.empresa.findMany({
      where: { id: { in: empresaIds } },
      select: {
        id: true,
        ruc: true,
        razonSocial: true,
        usuarioSol: true,
        habilitadoSunat: true,
        habilitadoSunafil: true,
        terminosSunafil: true,
        estadoConexion: true,
        estadoSincro: true,
        activo: true,
        ultimaSincronizacion: true,
        createdAt: true,
        _count: {
          select: {
            notificaciones: {
              where: { fechaMensaje: { gte: inicioAnio, lte: finAnio } },
            },
          },
        },
      },
      orderBy: { razonSocial: 'asc' },
    });
  }

  findOne(id: string, usuarioId: string) {
    return this.prisma.empresa.findFirst({
      where: { id, usuarioId },
    });
  }

  async update(id: string, updateEmpresaDto: any, usuarioId: string) {
    const dataToUpdate: any = { ...updateEmpresaDto };
    if (updateEmpresaDto.claveSol) {
      dataToUpdate.claveSol = this.encryptionService.encrypt(
        updateEmpresaDto.claveSol,
      );
    }
    return this.prisma.empresa.updateMany({
      where: { id, usuarioId },
      data: dataToUpdate,
    });
  }

  async toggleHabilitadoSunat(id: string, usuarioId: string) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id } });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }
    const nuevoEstado = !empresa.habilitadoSunat;
    const updated = await this.prisma.empresa.update({
      where: { id },
      data: { habilitadoSunat: nuevoEstado },
    });

    await this.auditService.log({
      usuarioId,
      accion: 'TOGGLE_MONITOREO_SUNAT',
      entidad: 'Empresa',
      entidadId: id,
      detalles: { ruc: empresa.ruc, razonSocial: empresa.razonSocial, habilitadoSunat: nuevoEstado },
    });

    return updated;
  }

  async toggleHabilitadoSunafil(id: string, usuarioId: string) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id } });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }
    const nuevoEstado = !empresa.habilitadoSunafil;
    const updated = await this.prisma.empresa.update({
      where: { id },
      data: { habilitadoSunafil: nuevoEstado },
    });

    await this.auditService.log({
      usuarioId,
      accion: 'TOGGLE_MONITOREO_SUNAFIL',
      entidad: 'Empresa',
      entidadId: id,
      detalles: { ruc: empresa.ruc, razonSocial: empresa.razonSocial, habilitadoSunafil: nuevoEstado },
    });

    return updated;
  }

  async remove(id: string, usuarioId: string) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id } });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    await this.prisma.notificacion.deleteMany({ where: { empresaId: id } });
    await this.prisma.empresaAsignacion.deleteMany({ where: { empresaId: id } });
    await this.prisma.eventoCalendario.deleteMany({ where: { empresaId: id } });
    await this.prisma.recordatorio.deleteMany({ where: { empresaId: id } });

    const deleted = await this.prisma.empresa.delete({ where: { id } });

    await this.auditService.log({
      usuarioId,
      accion: 'ELIMINAR_EMPRESA',
      entidad: 'Empresa',
      entidadId: id,
      detalles: { ruc: empresa.ruc, razonSocial: empresa.razonSocial },
    });

    return deleted;
  }

  /**
   * Resetea empresas atascadas en SYNCING por más de 10 minutos.
   * Necesario cuando Render se duerme y los jobs de BullMQ quedan huérfanos.
   */
  async resetStuckSync() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const result = await this.prisma.empresa.updateMany({
      where: {
        estadoSincro: 'SYNCING',
        updatedAt: { lt: tenMinutesAgo },
      },
      data: { estadoSincro: 'IDLE' },
    });
    return { reset: result.count };
  }

  /**
   * PERFIL 360° DE EMPRESA: Consolida el estado completo, analítica histórica,
   * distribución por origen/módulo y línea de tiempo de notificaciones.
   */
  async getPerfil(empresaId: string, usuarioId: string, rol: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
      include: {
        asignaciones: {
          include: {
            usuario: { select: { id: true, nombres: true, apellidos: true, email: true, rol: true } },
          },
        },
      },
    });

    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    // Verificar permisos si no es ADMIN/SUPER_ADMIN
    if (rol !== 'SUPER_ADMIN' && rol !== 'ADMIN') {
      const tieneAcceso = empresa.asignaciones.some((a) => a.usuarioId === usuarioId);
      if (!tieneAcceso && empresa.usuarioId !== usuarioId) {
        throw new BadRequestException('No tienes acceso a esta empresa');
      }
    }

    const [
      totalNotificaciones,
      sinLeer,
      sinPdf,
      notificacionesAll,
      lineaTiempo,
    ] = await Promise.all([
      this.prisma.notificacion.count({ where: { empresaId } }),
      this.prisma.notificacion.count({ where: { empresaId, leidoGlobal: false } }),
      this.prisma.notificacion.count({ where: { empresaId, estado: 'SIN_PDF' } }),
      this.prisma.notificacion.findMany({
        where: { empresaId },
        select: {
          id: true,
          origen: true,
          moduloSunafil: true,
          fechaMensaje: true,
          createdAt: true,
          montoExigible: true,
        },
      }),
      this.prisma.notificacion.findMany({
        where: { empresaId },
        include: {
          responsable: { select: { id: true, nombres: true, apellidos: true } },
        },
        orderBy: [{ fechaMensaje: 'desc' }, { createdAt: 'desc' }],
        take: 30,
      }),
    ]);

    // Conteo por origen
    let sunatCount = 0;
    let sunafilCount = 0;
    const moduloSunafilCount: Record<string, number> = {
      FISCALIZACION: 0,
      COBRANZA: 0,
      ACCIONES_PREVIAS: 0,
      ALERTAS_FORMALIZACION: 0,
      ALERTAS_SST: 0,
    };

    // Histórico últimos 12 meses
    const mapMeses = new Map<string, number>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      mapMeses.set(key, 0);
    }

    for (const n of notificacionesAll) {
      if (n.origen === 'SUNAFIL') {
        sunafilCount++;
        if (n.moduloSunafil && moduloSunafilCount[n.moduloSunafil] !== undefined) {
          moduloSunafilCount[n.moduloSunafil]++;
        }
      } else {
        sunatCount++;
      }

      const f = n.fechaMensaje || n.createdAt;
      const key = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
      if (mapMeses.has(key)) {
        mapMeses.set(key, (mapMeses.get(key) || 0) + 1);
      }
    }

    const historicoMensual = Array.from(mapMeses.entries()).map(([mes, cantidad]) => ({
      mes,
      cantidad,
    }));

    return {
      empresa: {
        id: empresa.id,
        ruc: empresa.ruc,
        razonSocial: empresa.razonSocial,
        estadoConexion: empresa.estadoConexion,
        estadoSincro: empresa.estadoSincro,
        ultimaSincronizacion: empresa.ultimaSincronizacion,
        habilitadoSunat: empresa.habilitadoSunat,
        habilitadoSunafil: empresa.habilitadoSunafil,
        terminosSunafil: empresa.terminosSunafil,
        activo: empresa.activo,
        createdAt: empresa.createdAt,
        usuariosAsignados: empresa.asignaciones.map((a) => a.usuario),
      },
      metricas: {
        totalNotificaciones,
        sinLeer,
        sinPdf,
        atendidas: totalNotificaciones - sinLeer,
        sunatCount,
        sunafilCount,
        moduloSunafilCount,
      },
      historicoMensual,
      lineaTiempo,
    };
  }
}
