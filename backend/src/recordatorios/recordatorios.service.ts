import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RecordatoriosService {
  constructor(private prisma: PrismaService) {}

  async findByUser(usuarioId: string) {
    return this.prisma.recordatorio.findMany({
      where: { usuarioId },
      include: {
        empresa: { select: { id: true, razonSocial: true, ruc: true } },
      },
      orderBy: [
        { completado: 'asc' },
        { fechaRecordar: 'asc' },
      ],
    });
  }

  async create(usuarioId: string, dto: {
    titulo: string;
    descripcion?: string;
    fechaRecordar: string;
    empresaId?: string;
    notificacionId?: string;
  }) {
    return this.prisma.recordatorio.create({
      data: {
        usuarioId,
        titulo: dto.titulo,
        descripcion: dto.descripcion || null,
        fechaRecordar: new Date(dto.fechaRecordar),
        empresaId: dto.empresaId || null,
        notificacionId: dto.notificacionId || null,
      },
      include: {
        empresa: { select: { id: true, razonSocial: true, ruc: true } },
      },
    });
  }

  async toggleCompletado(id: string, usuarioId: string) {
    const rec = await this.prisma.recordatorio.findUnique({ where: { id } });
    if (!rec || rec.usuarioId !== usuarioId) {
      throw new NotFoundException('Recordatorio no encontrado');
    }
    return this.prisma.recordatorio.update({
      where: { id },
      data: { completado: !rec.completado },
    });
  }

  async remove(id: string, usuarioId: string) {
    const rec = await this.prisma.recordatorio.findUnique({ where: { id } });
    if (!rec || rec.usuarioId !== usuarioId) {
      throw new NotFoundException('Recordatorio no encontrado');
    }
    return this.prisma.recordatorio.delete({ where: { id } });
  }
}
