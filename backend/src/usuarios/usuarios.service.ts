import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

export function generateAutoEmail(nombres: string, apellidos: string, dni: string): string {
  const cleanStr = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();

  // Iniciales de TODOS los nombres + iniciales de TODOS los apellidos + DNI
  const initNombres = (nombres || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => cleanStr(w).charAt(0))
    .join('');
  const initApellidos = (apellidos || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => cleanStr(w).charAt(0))
    .join('');
  const cleanDni = (dni || '').trim().replace(/\D/g, '');

  return `${initNombres}${initApellidos}${cleanDni}@oracon.com`;
}

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findAll(callerRol: string) {
    const where =
      callerRol === 'SUPER_ADMIN'
        ? {}
        : { rol: { not: 'SUPER_ADMIN' as any } };

    return this.prisma.usuario.findMany({
      where,
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidos: true,
        dni: true,
        rol: true,
        telegramChatId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidos: true,
        dni: true,
        rol: true,
        telegramChatId: true,
        createdAt: true,
        asignaciones: {
          include: {
            empresa: {
              select: {
                id: true,
                ruc: true,
                razonSocial: true,
                estadoConexion: true,
                estadoSincro: true,
                ultimaSincronizacion: true,
              },
            },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(data: {
    nombres: string;
    apellidos: string;
    dni: string;
    password: string;
    rol: string;
    telegramChatId?: string;
  }) {
    if (data.rol === 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'No se puede crear un usuario con rol Super Admin',
      );
    }

    if (!data.nombres || !data.nombres.trim()) {
      throw new BadRequestException('Los nombres son obligatorios');
    }
    if (!data.apellidos || !data.apellidos.trim()) {
      throw new BadRequestException('Los apellidos son obligatorios');
    }
    const cleanDni = (data.dni || '').trim().replace(/\D/g, '');
    if (cleanDni.length !== 8) {
      throw new BadRequestException('El DNI debe tener exactamente 8 dígitos');
    }
    if (!data.password || !data.password.trim()) {
      throw new BadRequestException('La contraseña es obligatoria');
    }

    const dniExists = await this.prisma.usuario.findUnique({
      where: { dni: cleanDni },
    });
    if (dniExists) {
      throw new ConflictException('El DNI ingresado ya pertenece a otro usuario');
    }

    const email = generateAutoEmail(data.nombres, data.apellidos, cleanDni);

    const emailExists = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (emailExists) {
      throw new ConflictException(`El correo autogenerado ${email} ya está registrado`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.usuario.create({
      data: {
        nombres: data.nombres.trim(),
        apellidos: data.apellidos.trim(),
        dni: cleanDni,
        email,
        password: hashedPassword,
        rol: data.rol as any,
        telegramChatId: data.telegramChatId ? data.telegramChatId.trim() : null,
      },
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidos: true,
        dni: true,
        rol: true,
        telegramChatId: true,
        createdAt: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      nombres?: string;
      apellidos?: string;
      dni?: string;
      password?: string;
      rol?: string;
      telegramChatId?: string;
    },
  ) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const updateData: any = {};
    if (data.nombres !== undefined) updateData.nombres = data.nombres.trim();
    if (data.apellidos !== undefined) updateData.apellidos = data.apellidos.trim();
    if (data.dni !== undefined) {
      const cleanDni = data.dni.trim().replace(/\D/g, '');
      if (cleanDni.length !== 8) {
        throw new BadRequestException('El DNI debe tener exactamente 8 dígitos');
      }
      updateData.dni = cleanDni;
    }
    if (data.rol !== undefined) updateData.rol = data.rol;
    if (data.telegramChatId !== undefined)
      updateData.telegramChatId = data.telegramChatId ? data.telegramChatId.trim() : null;

    if (data.password && data.password.trim()) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Regenerar correo si cambiaron los nombres, apellidos o DNI
    const finalNombres = updateData.nombres || user.nombres;
    const finalApellidos = updateData.apellidos || user.apellidos;
    const finalDni = updateData.dni || user.dni;

    if (
      updateData.nombres ||
      updateData.apellidos ||
      updateData.dni
    ) {
      updateData.email = generateAutoEmail(finalNombres, finalApellidos, finalDni);
    }

    return this.prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidos: true,
        dni: true,
        rol: true,
        telegramChatId: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.rol === 'SUPER_ADMIN')
      throw new ForbiddenException('No se puede eliminar al Super Admin');
    return this.prisma.usuario.delete({ where: { id } });
  }
}
