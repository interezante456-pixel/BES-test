import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EtiquetasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.etiqueta.findMany({
      include: {
        _count: { select: { notificaciones: true } },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async create(nombre: string, color?: string) {
    const cleanNombre = nombre.trim().toUpperCase();
    const existing = await this.prisma.etiqueta.findUnique({
      where: { nombre: cleanNombre },
    });
    if (existing) {
      throw new ConflictException('Ya existe una etiqueta con este nombre');
    }
    return this.prisma.etiqueta.create({
      data: {
        nombre: cleanNombre,
        color: color || '#f97316',
      },
    });
  }

  async asignar(notificacionId: string, etiquetaId: string) {
    return this.prisma.notificacionEtiqueta.upsert({
      where: {
        notificacionId_etiquetaId: { notificacionId, etiquetaId },
      },
      create: { notificacionId, etiquetaId },
      update: {},
    });
  }

  async desasignar(notificacionId: string, etiquetaId: string) {
    return this.prisma.notificacionEtiqueta.deleteMany({
      where: { notificacionId, etiquetaId },
    });
  }
}
