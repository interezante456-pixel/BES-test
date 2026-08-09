import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

/**
 * Servicio centralizado para obtener las empresas visibles por un usuario
 * según su rol. Único punto de verdad que reemplaza la lógica duplicada en
 * notificaciones, estadisticas y otros módulos.
 */
@Injectable()
export class EmpresaAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retorna los IDs de las empresas que el usuario puede ver según su rol:
   * - SUPER_ADMIN: Todas las empresas del sistema
   * - ADMIN: Todas las empresas del sistema (puede gestionar cualquiera)
   * - USUARIO_LOCAL: Solo las empresas que le han sido asignadas
   */
  async getEmpresaIds(usuarioId: string, rol: string): Promise<string[]> {
    if (rol === 'SUPER_ADMIN' || rol === 'ADMIN') {
      const empresas = await this.prisma.empresa.findMany({
        select: { id: true },
      });
      return empresas.map((e) => e.id);
    }

    const asignaciones = await this.prisma.empresaAsignacion.findMany({
      where: { usuarioId },
      select: { empresaId: true },
    });
    return asignaciones.map((a) => a.empresaId);
  }
}
