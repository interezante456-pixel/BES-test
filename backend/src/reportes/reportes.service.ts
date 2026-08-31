import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  /** Reporte mensual ejecutivo por empresa */
  async getReporteMensualEmpresa(empresaId: string, mesStr?: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { id: true, ruc: true, razonSocial: true },
    });
    if (!empresa) throw new BadRequestException('Empresa no encontrada');

    let startDate: Date;
    let endDate: Date;
    if (mesStr && /^\d{4}-\d{2}$/.test(mesStr)) {
      const [y, m] = mesStr.split('-').map(Number);
      startDate = new Date(y, m - 1, 1);
      endDate = new Date(y, m, 0, 23, 59, 59);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const notificaciones = await this.prisma.notificacion.findMany({
      where: {
        empresaId,
        fechaMensaje: { gte: startDate, lte: endDate },
      },
      include: {
        responsable: { select: { id: true, nombres: true, apellidos: true } },
      },
      orderBy: { fechaMensaje: 'asc' },
    });

    let deudaTotal = 0;
    for (const n of notificaciones) {
      if (n.montoExigible) {
        const num = parseFloat(n.montoExigible.replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) deudaTotal += num;
      }
    }

    return {
      periodo: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
      empresa,
      totalNotificaciones: notificaciones.length,
      deudaTotalEstimada: deudaTotal > 0 ? `S/ ${deudaTotal.toFixed(2)}` : 'S/ 0.00',
      notificaciones,
    };
  }

  /** Reporte de cartera con deuda exigible coactiva */
  async getReporteDeudaExigible(usuarioId: string, rol: string) {
    let empresaIds: string[];
    if (rol === 'SUPER_ADMIN' || rol === 'ADMIN') {
      const emps = await this.prisma.empresa.findMany({ select: { id: true } });
      empresaIds = emps.map((e) => e.id);
    } else {
      const asigs = await this.prisma.empresaAsignacion.findMany({
        where: { usuarioId },
        select: { empresaId: true },
      });
      empresaIds = asigs.map((a) => a.empresaId);
    }

    const notificacionesConDeuda = await this.prisma.notificacion.findMany({
      where: {
        empresaId: { in: empresaIds },
        OR: [
          { montoExigible: { not: null } },
          { expedienteCoactivo: { not: null } },
        ],
      },
      include: {
        empresa: { select: { id: true, razonSocial: true, ruc: true } },
        responsable: { select: { id: true, nombres: true, apellidos: true } },
      },
      orderBy: { fechaMensaje: 'desc' },
    });

    return {
      fechaGeneracion: new Date(),
      totalCasos: notificacionesConDeuda.length,
      casos: notificacionesConDeuda,
    };
  }

  /** Reporte de vencimientos de SUNAFIL y compromisos a 30 días */
  async getReporteVencimientos(usuarioId: string, rol: string, dias = 30) {
    let empresaIds: string[];
    if (rol === 'SUPER_ADMIN' || rol === 'ADMIN') {
      const emps = await this.prisma.empresa.findMany({ select: { id: true } });
      empresaIds = emps.map((e) => e.id);
    } else {
      const asigs = await this.prisma.empresaAsignacion.findMany({
        where: { usuarioId },
        select: { empresaId: true },
      });
      empresaIds = asigs.map((a) => a.empresaId);
    }

    const now = new Date();
    const futureDate = new Date(now.getTime() + dias * 24 * 60 * 60 * 1000);

    const proximos = await this.prisma.notificacion.findMany({
      where: {
        empresaId: { in: empresaIds },
        OR: [
          { fechaLimite: { gte: now, lte: futureDate } },
          { fechaCompromiso: { gte: now, lte: futureDate } },
        ],
      },
      include: {
        empresa: { select: { id: true, razonSocial: true, ruc: true } },
        responsable: { select: { id: true, nombres: true, apellidos: true } },
      },
      orderBy: [{ fechaLimite: 'asc' }, { fechaCompromiso: 'asc' }],
    });

    return {
      diasProyeccion: dias,
      totalVencimientos: proximos.length,
      items: proximos,
    };
  }
}
