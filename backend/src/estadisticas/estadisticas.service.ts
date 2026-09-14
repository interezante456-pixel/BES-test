import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { isUrgentAsunto } from '../common/notificacion-classifier';

@Injectable()
export class EstadisticasService {
  constructor(private prisma: PrismaService) {}

  // isUrgentAsunto migrado al helper compartido: src/common/notificacion-classifier.ts

  async getStats(usuarioId: string, userRol: string) {
    let empresaIds: string[];

    if (userRol === 'SUPER_ADMIN' || userRol === 'ADMIN') {
      const empresas = await this.prisma.empresa.findMany({
        select: { id: true },
      });
      empresaIds = empresas.map((e) => e.id);
    } else {
      const asignaciones = await this.prisma.empresaAsignacion.findMany({
        where: { usuarioId },
        select: { empresaId: true },
      });
      empresaIds = asignaciones.map((a) => a.empresaId);
    }

    if (empresaIds.length === 0) {
      return {
        totalEmpresas: 0,
        totalNotificaciones: 0,
        sinLeer: 0,
        sinPdf: 0,
        totalPeligrosas: 0,
        totalNormales: 0,
        rankingEmpresas: [],
        sincroPorDia: [],
        historicoMensual: [],
      };
    }

    const [totalEmpresas, empresasSunat, empresasSunafil, notificacionesAll, sinPdf, rankingRaw] =
      await Promise.all([
        this.prisma.empresa.count({ where: { id: { in: empresaIds } } }),
        this.prisma.empresa.count({ where: { id: { in: empresaIds }, habilitadoSunat: true } }),
        this.prisma.empresa.count({ where: { id: { in: empresaIds }, habilitadoSunafil: true } }),
        this.prisma.notificacion.findMany({
          where: { empresaId: { in: empresaIds } },
          select: { id: true, asunto: true, createdAt: true, fechaMensaje: true },
        }),
        this.prisma.notificacion.count({
          where: { empresaId: { in: empresaIds }, estado: 'SIN_PDF' },
        }),
        this.prisma.empresa.findMany({
          where: { id: { in: empresaIds } },
          select: {
            id: true,
            ruc: true,
            razonSocial: true,
            estadoConexion: true,
            _count: { select: { notificaciones: true } },
            notificaciones: {
              where: { estado: 'SIN_PDF' },
              select: { id: true },
            },
          },
        }),
      ]);


    const totalNotificaciones = notificacionesAll.length;
    let totalPeligrosas = 0;
    let totalNormales = 0;

    for (const n of notificacionesAll) {
      if (isUrgentAsunto(n.asunto)) {
        totalPeligrosas++;
      } else {
        totalNormales++;
      }
    }

    // sinLeer por entidad (SUNAT vs SUNAFIL)
    const [sinLeerSunat, sinLeerSunafil] = await Promise.all([
      this.prisma.notificacion.count({
        where: {
          empresaId: { in: empresaIds },
          leidoGlobal: false,
          origen: 'SUNAT',
        },
      }),
      this.prisma.notificacion.count({
        where: {
          empresaId: { in: empresaIds },
          leidoGlobal: false,
          origen: 'SUNAFIL',
        },
      }),
    ]);
    const sinLeer = sinLeerSunat;

    const rankingEmpresas = rankingRaw
      .map((e) => ({
        id: e.id,
        ruc: e.ruc,
        razonSocial: e.razonSocial,
        estadoConexion: e.estadoConexion,
        totalNotificaciones: e._count.notificaciones,
        sinPdf: e.notificaciones.length,
      }))
      .sort((a, b) => b.sinPdf - a.sinPdf)
      .slice(0, 10);

    // Actividad últimos 7 días con desglose Peligrosas vs Normales
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 6);
    hace7dias.setHours(0, 0, 0, 0);

    const sincroPorDia: {
      fecha: string;
      cantidad: number;
      peligrosas: number;
      normales: number;
    }[] = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];

      const notifsDia = notificacionesAll.filter((n) => {
        const dStr = (n.fechaMensaje || n.createdAt).toISOString().split('T')[0];
        return dStr === fechaStr;
      });

      let peligrosas = 0;
      let normales = 0;

      for (const nd of notifsDia) {
        if (isUrgentAsunto(nd.asunto)) peligrosas++;
        else normales++;
      }

      sincroPorDia.push({
        fecha: fechaStr,
        cantidad: notifsDia.length,
        peligrosas,
        normales,
      });
    }

    // Histórico Mensual completo (agrupado por YYYY-MM)
    const mesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
    const mapMeses = new Map<string, { mesKey: string; mesNombre: string; cantidad: number; peligrosas: number; normales: number }>();

    for (const n of notificacionesAll) {
      const d = n.fechaMensaje || n.createdAt;
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const mesKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
      const mesNombre = `${mesNombres[monthIdx]} ${year}`;

      if (!mapMeses.has(mesKey)) {
        mapMeses.set(mesKey, { mesKey, mesNombre, cantidad: 0, peligrosas: 0, normales: 0 });
      }

      const item = mapMeses.get(mesKey)!;
      item.cantidad++;
      if (isUrgentAsunto(n.asunto)) {
        item.peligrosas++;
      } else {
        item.normales++;
      }
    }

    const historicoMensual = Array.from(mapMeses.values()).sort((a, b) => a.mesKey.localeCompare(b.mesKey));

    return {
      totalEmpresas,
      empresasSunat,
      empresasSunafil,
      totalNotificaciones,
      sinLeer,
      sinLeerSunat,
      sinLeerSunafil,
      sinLeerTotal: sinLeerSunat + sinLeerSunafil,
      sinPdf,
      totalPeligrosas,
      totalNormales,
      rankingEmpresas,
      sincroPorDia,
      historicoMensual,
    };
  }

  /**
   * MORNING BRIEF: Panel 360 contextual de las últimas 24 horas y vencimientos inmediatos.
   * Diseñado como el primer punto de contacto diario para el equipo tributario y contable.
   */
  async getMorningBrief(usuarioId: string, userRol: string) {
    let empresaIds: string[];

    if (userRol === 'SUPER_ADMIN' || userRol === 'ADMIN') {
      const empresas = await this.prisma.empresa.findMany({ select: { id: true } });
      empresaIds = empresas.map((e) => e.id);
    } else {
      const asignaciones = await this.prisma.empresaAsignacion.findMany({
        where: { usuarioId },
        select: { empresaId: true },
      });
      empresaIds = asignaciones.map((a) => a.empresaId);
    }

    if (empresaIds.length === 0) {
      return {
        resumen: {
          nuevas24h: 0,
          urgentes24h: 0,
          misAsignadasPendientes: 0,
          plazos3Dias: 0,
          empresasConError: 0,
        },
        novedades24h: [],
        semaforoEmpresas: [],
        plazosProximos: [],
      };
    }

    const now = new Date();
    const hace24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const en3Dias = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const en7Dias = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      nuevas24hList,
      misAsignadasList,
      plazosProximosList,
      empresasData,
    ] = await Promise.all([
      // 1. Notificaciones llegadas en las últimas 24 horas
      this.prisma.notificacion.findMany({
        where: {
          empresaId: { in: empresaIds },
          OR: [
            { createdAt: { gte: hace24h } },
            { fechaMensaje: { gte: hace24h } },
          ],
        },
        include: {
          empresa: { select: { id: true, razonSocial: true, ruc: true } },
          responsable: { select: { id: true, nombres: true, apellidos: true } },
        },
        orderBy: [{ fechaMensaje: 'desc' }, { createdAt: 'desc' }],
        take: 50,
      }),

      // 2. Notificaciones asignadas a este usuario que aún no están respondidas ni archivadas
      this.prisma.notificacion.findMany({
        where: {
          responsableId: usuarioId,
          NOT: { estadoGestion: { in: ['RESPONDIDO', 'ARCHIVADO'] } },
        },
        include: {
          empresa: { select: { id: true, razonSocial: true, ruc: true } },
        },
        orderBy: [
          { fechaCompromiso: 'asc' },
          { fechaMensaje: 'desc' },
        ],
        take: 20,
      }),

      // 3. Plazos próximos que vencen en los próximos 7 días (SUNAFIL o compromisos de equipo)
      this.prisma.notificacion.findMany({
        where: {
          empresaId: { in: empresaIds },
          OR: [
            { fechaLimite: { gte: now, lte: en7Dias } },
            { fechaCompromiso: { gte: now, lte: en7Dias } },
          ],
        },
        include: {
          empresa: { select: { id: true, razonSocial: true, ruc: true } },
          responsable: { select: { id: true, nombres: true, apellidos: true } },
        },
        orderBy: [
          { fechaLimite: 'asc' },
          { fechaCompromiso: 'asc' },
        ],
        take: 25,
      }),

      // 4. Directorio de empresas para el semáforo de estado
      this.prisma.empresa.findMany({
        where: { id: { in: empresaIds } },
        select: {
          id: true,
          ruc: true,
          razonSocial: true,
          estadoConexion: true,
          estadoSincro: true,
          ultimaSincronizacion: true,
          notificaciones: {
            where: {
              OR: [
                { createdAt: { gte: hace24h } },
                { fechaMensaje: { gte: hace24h } },
              ],
            },
            select: { id: true, asunto: true, leidoGlobal: true },
          },
        },
        orderBy: { razonSocial: 'asc' },
      }),
    ]);

    // Calcular métricas
    let urgentes24h = 0;
    const novedadesFormateadas = nuevas24hList.map((n) => {
      const urgente = isUrgentAsunto(n.asunto);
      if (urgente) urgentes24h++;
      return {
        id: n.id,
        asunto: n.asunto,
        origen: n.origen,
        tipo: n.tipo,
        moduloSunafil: n.moduloSunafil,
        fechaMensaje: n.fechaMensaje,
        estado: n.estado,
        estadoGestion: n.estadoGestion,
        leidoGlobal: n.leidoGlobal,
        urgente,
        empresa: n.empresa,
        responsable: n.responsable,
        rutaArchivoPdf: n.rutaArchivoPdf,
      };
    });

    const plazos3Dias = plazosProximosList.filter((p) => {
      const f = p.fechaLimite || p.fechaCompromiso;
      return f && f <= en3Dias;
    }).length;

    let empresasConError = 0;
    const semaforoEmpresas = empresasData.map((emp) => {
      const nuevasCount = emp.notificaciones.length;
      let urgentesCount = 0;
      for (const n of emp.notificaciones) {
        if (isUrgentAsunto(n.asunto)) urgentesCount++;
      }

      const tieneError = emp.estadoSincro === 'ERROR' || emp.estadoConexion === 'ERROR_SISTEMA';
      if (tieneError) empresasConError++;

      let nivelAlerta: 'ROJO' | 'AMARILLO' | 'VERDE' = 'VERDE';
      if (tieneError || urgentesCount > 0) {
        nivelAlerta = 'ROJO';
      } else if (nuevasCount > 0) {
        nivelAlerta = 'AMARILLO';
      }

      return {
        id: emp.id,
        ruc: emp.ruc,
        razonSocial: emp.razonSocial,
        estadoConexion: emp.estadoConexion,
        estadoSincro: emp.estadoSincro,
        ultimaSincronizacion: emp.ultimaSincronizacion,
        nuevasHoy: nuevasCount,
        urgentesHoy: urgentesCount,
        nivelAlerta,
      };
    }).sort((a, b) => {
      // Ordenar: primero ROJO, luego AMARILLO, luego VERDE
      const peso = { ROJO: 0, AMARILLO: 1, VERDE: 2 };
      return peso[a.nivelAlerta] - peso[b.nivelAlerta];
    });

    return {
      resumen: {
        nuevas24h: nuevas24hList.length,
        urgentes24h,
        misAsignadasPendientes: misAsignadasList.length,
        plazos3Dias,
        empresasConError,
      },
      novedades24h: novedadesFormateadas.slice(0, 15),
      misAsignadas: misAsignadasList,
      semaforoEmpresas,
      plazosProximos: plazosProximosList.map((p) => ({
        id: p.id,
        asunto: p.asunto,
        origen: p.origen,
        codigoReferencia: p.codigoReferencia,
        fechaLimite: p.fechaLimite,
        fechaCompromiso: p.fechaCompromiso,
        fechaEfectiva: p.fechaLimite || p.fechaCompromiso,
        tipoPlazo: p.fechaLimite ? 'SUNAFIL_LEGAL' : 'COMPROMISO_EQUIPO',
        diasRestantes: Math.ceil(
          ((p.fechaLimite || p.fechaCompromiso)!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
        empresa: p.empresa,
        responsable: p.responsable,
      })),
    };
  }

  /**
   * CALENDARIO: Devuelve todos los eventos, plazos de SUNAFIL, compromisos de equipo
   * y eventos manuales dentro del mes solicitado (formato YYYY-MM).
   */
  async getCalendarioEventos(usuarioId: string, userRol: string, mesStr?: string) {
    let empresaIds: string[];

    if (userRol === 'SUPER_ADMIN' || userRol === 'ADMIN') {
      const empresas = await this.prisma.empresa.findMany({ select: { id: true } });
      empresaIds = empresas.map((e) => e.id);
    } else {
      const asignaciones = await this.prisma.empresaAsignacion.findMany({
        where: { usuarioId },
        select: { empresaId: true },
      });
      empresaIds = asignaciones.map((a) => a.empresaId);
    }

    // Determinar rango del mes
    let targetYear: number;
    let targetMonth: number; // 0-indexed
    if (mesStr && /^\d{4}-\d{2}$/.test(mesStr)) {
      const [y, m] = mesStr.split('-').map(Number);
      targetYear = y;
      targetMonth = m - 1;
    } else {
      const now = new Date();
      targetYear = now.getFullYear();
      targetMonth = now.getMonth();
    }

    const startDate = new Date(targetYear, targetMonth, 1, 0, 0, 0);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const [notifsSunafil, notifsCompromiso, eventosManuales] = await Promise.all([
      // 1. Vencimientos SUNAFIL
      this.prisma.notificacion.findMany({
        where: {
          empresaId: { in: empresaIds },
          fechaLimite: { gte: startDate, lte: endDate },
        },
        include: {
          empresa: { select: { id: true, razonSocial: true, ruc: true } },
          responsable: { select: { id: true, nombres: true, apellidos: true } },
        },
      }),

      // 2. Compromisos internos del equipo
      this.prisma.notificacion.findMany({
        where: {
          empresaId: { in: empresaIds },
          fechaCompromiso: { gte: startDate, lte: endDate },
        },
        include: {
          empresa: { select: { id: true, razonSocial: true, ruc: true } },
          responsable: { select: { id: true, nombres: true, apellidos: true } },
        },
      }),

      // 3. Eventos manuales del calendario
      this.prisma.eventoCalendario.findMany({
        where: {
          OR: [
            { usuarioId },
            { empresaId: { in: empresaIds } },
          ],
          fecha: { gte: startDate, lte: endDate },
        },
        include: {
          empresa: { select: { id: true, razonSocial: true, ruc: true } },
        },
        orderBy: { fecha: 'asc' },
      }),
    ]);

    const eventos: any[] = [];

    // Mapear SUNAFIL
    for (const n of notifsSunafil) {
      if (!n.fechaLimite) continue;
      const dateKey = n.fechaLimite.toISOString().split('T')[0];
      eventos.push({
        id: `sunafil-${n.id}`,
        notificacionId: n.id,
        fecha: dateKey,
        fechaCompleta: n.fechaLimite,
        tipo: 'SUNAFIL_VENCIMIENTO',
        origen: n.origen,
        titulo: `${n.empresa?.razonSocial || 'Empresa'}: Plazo SUNAFIL`,
        descripcion: n.asunto,
        codigoReferencia: n.codigoReferencia,
        modulo: n.moduloSunafil,
        urgencia: 'ALTA',
        empresa: n.empresa,
        responsable: n.responsable,
      });
    }

    // Mapear Compromisos
    for (const n of notifsCompromiso) {
      if (!n.fechaCompromiso) continue;
      const dateKey = n.fechaCompromiso.toISOString().split('T')[0];
      eventos.push({
        id: `compromiso-${n.id}`,
        notificacionId: n.id,
        fecha: dateKey,
        fechaCompleta: n.fechaCompromiso,
        tipo: 'COMPROMISO_EQUIPO',
        origen: n.origen,
        titulo: `Compromiso: ${n.empresa?.razonSocial || 'Empresa'}`,
        descripcion: n.asunto,
        notasInternas: n.notasInternas,
        urgencia: 'MEDIA',
        empresa: n.empresa,
        responsable: n.responsable,
      });
    }

    // Mapear Manuales
    for (const ev of eventosManuales) {
      const dateKey = ev.fecha.toISOString().split('T')[0];
      eventos.push({
        id: ev.id,
        fecha: dateKey,
        fechaCompleta: ev.fecha,
        tipo: ev.tipo || 'MANUAL',
        titulo: ev.titulo,
        descripcion: ev.descripcion,
        urgencia: 'NORMAL',
        empresa: ev.empresa,
        esManual: true,
      });
    }

    return {
      mes: `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`,
      totalEventos: eventos.length,
      eventos,
    };
  }

  /** Crear evento manual en el calendario */
  async createEventoCalendario(usuarioId: string, dto: {
    titulo: string;
    descripcion?: string;
    fecha: string;
    empresaId?: string;
    tipo?: string;
  }) {
    return this.prisma.eventoCalendario.create({
      data: {
        usuarioId,
        titulo: dto.titulo,
        descripcion: dto.descripcion || null,
        fecha: new Date(dto.fecha),
        empresaId: dto.empresaId || null,
        tipo: dto.tipo || 'MANUAL',
      },
      include: {
        empresa: { select: { id: true, razonSocial: true, ruc: true } },
      },
    });
  }

  /** Eliminar evento manual en el calendario */
  async deleteEventoCalendario(id: string, usuarioId: string, userRol: string) {
    const evento = await this.prisma.eventoCalendario.findUnique({ where: { id } });
    if (!evento) return { success: true };
    if (userRol !== 'SUPER_ADMIN' && userRol !== 'ADMIN' && evento.usuarioId !== usuarioId) {
      return { success: false, message: 'No autorizado' };
    }
    await this.prisma.eventoCalendario.delete({ where: { id } });
    return { success: true };
  }
}
