import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PdfParserService } from '../scraper/shared/pdf-parser.service';
import { EmpresaAccessService } from '../common/empresa-access.service';
import { EventsGateway } from '../events/events.gateway';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificacionesService implements OnModuleInit {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    private prisma: PrismaService,
    private pdfParserService: PdfParserService,
    private empresaAccessService: EmpresaAccessService,
    private eventsGateway: EventsGateway,
  ) {}

  async onModuleInit() {
    // B8: El backfill automático al inicio fue eliminado para no sobrecargar el startup.
    // Puede ejecutarse manualmente desde el endpoint: POST /notificaciones/backfill
    // o periódicamente via un cron job en cron.service.ts si se requiere.
  }

  async backfillPdfData() {
    this.logger.log('🔍 Iniciando verificación y retro-extracción de montos exigibles en PDFs...');
    const notifs = await this.prisma.notificacion.findMany({
      where: {
        rutaArchivoPdf: { not: null },
        OR: [{ montoExigible: null }, { expedienteCoactivo: null }],
      },
      select: { id: true, rutaArchivoPdf: true, asunto: true },
    });

    if (notifs.length === 0) {
      this.logger.log('✅ Todos los PDFs ya cuentan con información extraída.');
      return;
    }

    this.logger.log(`📄 Procesando ${notifs.length} notificación(es) pendientes...`);
    let updatedCount = 0;

    for (const notif of notifs) {
      if (!notif.rutaArchivoPdf) continue;
      const fileName = notif.rutaArchivoPdf.split('/uploads/').pop();
      if (!fileName) continue;

      const filePath = path.join(process.cwd(), 'uploads', fileName);
      if (fs.existsSync(filePath)) {
        const extracted = await this.pdfParserService.parsePdfFile(filePath);
        if (extracted.montoExigible || extracted.expedienteCoactivo) {
          await this.prisma.notificacion.update({
            where: { id: notif.id },
            data: {
              montoExigible: extracted.montoExigible,
              expedienteCoactivo: extracted.expedienteCoactivo,
            },
          });
          updatedCount++;
        }
      }
    }

    this.logger.log(`✅ Retro-extracción completada: ${updatedCount} notificación(es) actualizadas con montos de deuda.`);
  }

  /** Obtiene los IDs de empresas visibles para el usuario según su rol */
  private async getEmpresaIds(
    usuarioId: string,
    rol: string,
  ): Promise<string[]> {
    return this.empresaAccessService.getEmpresaIds(usuarioId, rol);
  }

  /** BANDEJA: notificaciones no leídas globalmente (por ningún usuario de la empresa) */
  async findBandejaByUser(usuarioId: string, rol: string, filters: any = {}) {
    const empresaIds = await this.getEmpresaIds(usuarioId, rol);
    if (empresaIds.length === 0) return { data: [], meta: { total: 0, page: 1, lastPage: 1 } };

    // Bandeja global: muestra las no leídas por NADIE (leidoGlobal = false)
    return this.buildPaginatedQuery(empresaIds, false, filters);
  }

  /** ARCHIVO: notificaciones ya leídas por al menos un usuario */
  async findArchivoByUser(usuarioId: string, rol: string, filters: any = {}) {
    const empresaIds = await this.getEmpresaIds(usuarioId, rol);
    if (empresaIds.length === 0) return { data: [], meta: { total: 0, page: 1, lastPage: 1 } };

    // Archivo global: muestra las que YA fueron abiertas por algún usuario
    return this.buildPaginatedQuery(empresaIds, true, filters);
  }

  private async buildPaginatedQuery(empresaIds: string[], leidoGlobal: boolean, filters: any) {
    const { page = 1, limit = 50, empresa, search, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const whereParams: any = {
      empresaId: { in: empresaIds },
      leidoGlobal,
    };

    if (empresa) {
      whereParams.empresaId = empresa;
    }

    if (search) {
      whereParams.OR = [
        { asunto: { contains: search, mode: 'insensitive' } },
        { empresa: { razonSocial: { contains: search, mode: 'insensitive' } } },
        { empresa: { ruc: { contains: search } } },
      ];
    }

    if (startDate || endDate) {
      whereParams.fechaMensaje = {};
      if (startDate) whereParams.fechaMensaje.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) whereParams.fechaMensaje.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    const [total, data] = await Promise.all([
      this.prisma.notificacion.count({ where: whereParams }),
      this.prisma.notificacion.findMany({
        where: whereParams,
        include: { empresa: { select: { id: true, razonSocial: true, ruc: true } } },
        orderBy: { fechaMensaje: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }


  /** Marca una notificación como leída globalmente y registra en la bitácora de auditoría */
  async markAsRead(notificacionId: string, usuarioId: string) {
    // Obtener datos del usuario para el registro de auditoría
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { nombres: true, apellidos: true },
    });
    const nombreCompleto = usuario
      ? `${usuario.nombres} ${usuario.apellidos}`.trim()
      : 'Usuario desconocido';

    // 1. Registrar en la bitácora de auditoría (quién y cuándo abrió la notificación)
    await this.prisma.notificacionLectura.upsert({
      where: { notificacionId_usuarioId: { notificacionId, usuarioId } },
      create: { notificacionId, usuarioId },
      update: {},
    });

    // 2. Marcar como leída globalmente si aún no lo está (solo la primera apertura registra el usuario)
    await this.prisma.notificacion.updateMany({
      where: { id: notificacionId, leidoGlobal: false },
      data: {
        leidoGlobal: true,
        leidoEn: new Date(),
        leidoPorId: usuarioId,
        leidoPorNombre: nombreCompleto,
      },
    });

    // 3. Emitir evento WebSocket en tiempo real a todos los navegadores conectados
    this.eventsGateway.emitAll('notificacion:leida', {
      id: notificacionId,
      usuarioId,
      nombreCompleto,
    });

    return { success: true };
  }

  /** Marca TODAS las notificaciones sin leer como leídas globalmente */
  async markAllAsRead(usuarioId: string, rol: string) {
    const empresaIds = await this.getEmpresaIds(usuarioId, rol);
    if (empresaIds.length === 0) return { count: 0 };

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { nombres: true, apellidos: true },
    });
    const nombreCompleto = usuario
      ? `${usuario.nombres} ${usuario.apellidos}`.trim()
      : 'Usuario desconocido';

    // Obtener las que aún no han sido leídas globalmente
    const sinLeer = await this.prisma.notificacion.findMany({
      where: { empresaId: { in: empresaIds }, leidoGlobal: false },
      select: { id: true },
    });

    if (sinLeer.length === 0) return { count: 0 };

    const now = new Date();

    // 1. Marcar todas como leídas globalmente
    await this.prisma.notificacion.updateMany({
      where: { id: { in: sinLeer.map((n) => n.id) } },
      data: {
        leidoGlobal: true,
        leidoEn: now,
        leidoPorId: usuarioId,
        leidoPorNombre: nombreCompleto,
      },
    });

    // 2. Registrar en bitácora de auditoría (para tener quién las marcó masivamente)
    const lecturas = sinLeer.map((n) => ({ notificacionId: n.id, usuarioId }));
    await this.prisma.notificacionLectura.createMany({
      data: lecturas,
      skipDuplicates: true,
    });

    // 3. Emitir evento WebSocket en tiempo real a todos los navegadores conectados
    this.eventsGateway.emitAll('notificacion:todas_leidas', {
      usuarioId,
      nombreCompleto,
      count: sinLeer.length,
    });

    return { count: sinLeer.length };
  }

  /** Retorna el historial de auditoría: todos los usuarios que abrieron una notificación */
  async getReadHistory(notificacionId: string) {
    const lecturas = await this.prisma.notificacionLectura.findMany({
      where: { notificacionId },
      include: {
        usuario: { select: { nombres: true, apellidos: true } },
      },
      orderBy: { creadoAt: 'asc' },
    });

    return lecturas.map((l) => ({
      usuarioId: l.usuarioId,
      nombreCompleto: `${l.usuario.nombres} ${l.usuario.apellidos}`.trim(),
      abiertaEn: l.creadoAt,
    }));
  }

  private deletePdfFile(rutaArchivoPdf: string | null) {
    if (!rutaArchivoPdf) return;
    try {
      const fileName = rutaArchivoPdf.split('/uploads/').pop();
      if (!fileName) return;
      const filePath = path.join(process.cwd(), 'uploads', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Error eliminando PDF del disco:', err);
    }
  }

  async removeOne(id: string, usuarioId: string, rol: string) {
    if (rol !== 'SUPER_ADMIN' && rol !== 'ADMIN') {
      throw new ForbiddenException(
        'Solo administradores pueden eliminar notificaciones',
      );
    }

    const notif = await this.prisma.notificacion.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('Notificación no encontrada');

    this.deletePdfFile(notif.rutaArchivoPdf);

    await this.prisma.notificacion.delete({ where: { id } });
    return { success: true };
  }

  async removeAllByUser(usuarioId: string, rol: string) {
    const empresaIds = await this.getEmpresaIds(usuarioId, rol);
    if (empresaIds.length === 0) return { count: 0 };

    const notifs = await this.prisma.notificacion.findMany({
      where: { empresaId: { in: empresaIds } },
      select: { rutaArchivoPdf: true },
    });

    notifs.forEach((n) => this.deletePdfFile(n.rutaArchivoPdf));

    return this.prisma.notificacion.deleteMany({
      where: { empresaId: { in: empresaIds } },
    });
  }

  async removeMany(ids: string[], usuarioId: string, rol: string) {
    if (rol !== 'SUPER_ADMIN' && rol !== 'ADMIN') {
      throw new ForbiddenException(
        'Solo administradores pueden eliminar notificaciones',
      );
    }

    if (!ids || ids.length === 0) return { count: 0 };

    const notifs = await this.prisma.notificacion.findMany({
      where: { id: { in: ids } },
      select: { rutaArchivoPdf: true },
    });

    notifs.forEach((n) => this.deletePdfFile(n.rutaArchivoPdf));

    return this.prisma.notificacion.deleteMany({
      where: { id: { in: ids } },
    });
  }

  /** SUNAFIL: Consulta especializada de notificaciones laborales */
  async findSunafilNotificaciones(usuarioId: string, rol: string, filters: any = {}) {
    const empresaIds = await this.getEmpresaIds(usuarioId, rol);
    if (empresaIds.length === 0) return { data: [], meta: { total: 0, page: 1, lastPage: 1 } };

    const {
      page = 1,
      limit = 50,
      empresa,
      modulo,
      search,
      startDate,
      endDate,
      estado,
    } = filters;

    const skip = (page - 1) * limit;

    const whereParams: any = {
      empresaId: { in: empresaIds },
      origen: 'SUNAFIL',
    };

    if (empresa && empresa !== 'all') {
      whereParams.empresaId = empresa;
    }

    if (modulo && modulo !== 'ALL') {
      whereParams.moduloSunafil = modulo;
    }

    if (estado && estado !== 'ALL') {
      whereParams.estado = estado;
    }

    if (search) {
      whereParams.OR = [
        { asunto: { contains: search, mode: 'insensitive' } },
        { codigoReferencia: { contains: search, mode: 'insensitive' } },
        { intendencia: { contains: search, mode: 'insensitive' } },
        { empresa: { razonSocial: { contains: search, mode: 'insensitive' } } },
        { empresa: { ruc: { contains: search } } },
      ];
    }

    if (startDate || endDate) {
      whereParams.fechaMensaje = {};
      if (startDate) whereParams.fechaMensaje.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) whereParams.fechaMensaje.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    const [total, data] = await Promise.all([
      this.prisma.notificacion.count({ where: whereParams }),
      this.prisma.notificacion.findMany({
        where: whereParams,
        include: {
          empresa: {
            select: { id: true, razonSocial: true, ruc: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }

  /** SUNAFIL: Métricas agregadas por módulo y plazos */
  async getSunafilMetricas(usuarioId: string, rol: string, empresaId?: string) {
    const empresaIds = await this.getEmpresaIds(usuarioId, rol);
    if (empresaIds.length === 0) {
      return {
        total: 0,
        fiscalizacion: 0,
        cobranza: 0,
        accionesPrevias: 0,
        formalizacion: 0,
        sst: 0,
        porVencer: 0,
      };
    }

    const baseWhere: any = {
      empresaId: { in: empresaIds },
      origen: 'SUNAFIL',
    };

    if (empresaId && empresaId !== 'all') {
      baseWhere.empresaId = empresaId;
    }

    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);

    const [
      total,
      fiscalizacion,
      cobranza,
      accionesPrevias,
      formalizacion,
      sst,
      porVencer,
    ] = await Promise.all([
      this.prisma.notificacion.count({ where: baseWhere }),
      this.prisma.notificacion.count({
        where: { ...baseWhere, moduloSunafil: 'FISCALIZACION' },
      }),
      this.prisma.notificacion.count({
        where: { ...baseWhere, moduloSunafil: 'COBRANZA' },
      }),
      this.prisma.notificacion.count({
        where: { ...baseWhere, moduloSunafil: 'ACCIONES_PREVIAS' },
      }),
      this.prisma.notificacion.count({
        where: { ...baseWhere, moduloSunafil: 'ALERTAS_FORMALIZACION' },
      }),
      this.prisma.notificacion.count({
        where: { ...baseWhere, moduloSunafil: 'ALERTAS_SST' },
      }),
      this.prisma.notificacion.count({
        where: {
          ...baseWhere,
          fechaLimite: {
            gte: now,
            lte: in7Days,
          },
        },
      }),
    ]);

    return {
      total,
      fiscalizacion,
      cobranza,
      accionesPrevias,
      formalizacion,
      sst,
      porVencer,
    };
  }
}
