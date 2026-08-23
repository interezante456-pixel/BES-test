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
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificacionesService implements OnModuleInit {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    private prisma: PrismaService,
    private pdfParserService: PdfParserService,
    private empresaAccessService: EmpresaAccessService,
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

  /** BANDEJA: notificaciones que este usuario AÚN NO ha leído */
  async findBandejaByUser(usuarioId: string, rol: string, filters: any = {}) {
    const empresaIds = await this.getEmpresaIds(usuarioId, rol);
    if (empresaIds.length === 0) return { data: [], meta: { total: 0, page: 1, lastPage: 1 } };

    return this.buildPaginatedQuery(empresaIds, { none: { usuarioId } }, filters);
  }

  /** ARCHIVO: notificaciones que este usuario YA leyó */
  async findArchivoByUser(usuarioId: string, rol: string, filters: any = {}) {
    const empresaIds = await this.getEmpresaIds(usuarioId, rol);
    if (empresaIds.length === 0) return { data: [], meta: { total: 0, page: 1, lastPage: 1 } };

    return this.buildPaginatedQuery(empresaIds, { some: { usuarioId } }, filters);
  }

  private async buildPaginatedQuery(empresaIds: string[], lecturasCondition: any, filters: any) {
    const { page = 1, limit = 50, empresa, search, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const whereParams: any = {
      empresaId: { in: empresaIds },
      lecturas: lecturasCondition,
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


  /** Marca una notificación como leída SOLO para este usuario */
  async markAsRead(notificacionId: string, usuarioId: string) {
    return this.prisma.notificacionLectura.upsert({
      where: { notificacionId_usuarioId: { notificacionId, usuarioId } },
      create: { notificacionId, usuarioId },
      update: {},
    });
  }

  /** Marca TODAS las notificaciones de bandeja como leídas para este usuario */
  async markAllAsRead(usuarioId: string, rol: string) {
    const empresaIds = await this.getEmpresaIds(usuarioId, rol);
    if (empresaIds.length === 0) return { count: 0 };

    const sinLeer = await this.prisma.notificacion.findMany({
      where: {
        empresaId: { in: empresaIds },
        lecturas: { none: { usuarioId } },
      },
      select: { id: true },
    });

    const lecturas = sinLeer.map((n) => ({ notificacionId: n.id, usuarioId }));
    await this.prisma.notificacionLectura.createMany({
      data: lecturas,
      skipDuplicates: true,
    });

    return { count: lecturas.length };
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
