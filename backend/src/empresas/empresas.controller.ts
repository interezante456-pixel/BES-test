import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('empresas')
export class EmpresasController {
  constructor(
    private readonly empresasService: EmpresasService,
    private readonly prisma: PrismaService,
  ) {}

  /** Obtiene el ID del SUPER_ADMIN dueño del sistema (para que ADMIN pueda crear empresas bajo su nombre) */
  private async getSuperAdminId(
    callerRol: string,
    callerId: string,
  ): Promise<string> {
    if (callerRol === 'SUPER_ADMIN') return callerId;
    // ADMIN: buscar al SUPER_ADMIN del sistema
    const superAdmin = await this.prisma.usuario.findFirst({
      where: { rol: 'SUPER_ADMIN' },
    });
    return superAdmin?.id ?? callerId;
  }

  @Post()
  async create(@Body() createEmpresaDto: any, @Request() req: any) {
    const ownerId = await this.getSuperAdminId(req.user.rol, req.user.id);
    return this.empresasService.create(createEmpresaDto, ownerId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.empresasService.findAllByUser(req.user.id, req.user.rol);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.empresasService.findOne(id, req.user.id);
  }

  @Get(':id/perfil')
  getPerfil(@Param('id') id: string, @Request() req: any) {
    return this.empresasService.getPerfil(id, req.user.id, req.user.rol);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmpresaDto: any,
    @Request() req: any,
  ) {
    const ownerId = await this.getSuperAdminId(req.user.rol, req.user.id);
    return this.empresasService.update(id, updateEmpresaDto, ownerId);
  }

  @Patch(':id/toggle-sunat')
  async toggleSunat(@Param('id') id: string, @Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN' && req.user.rol !== 'ADMIN') {
      throw new BadRequestException('No tienes permisos para modificar el monitoreo.');
    }
    return this.empresasService.toggleHabilitadoSunat(id, req.user.id);
  }

  @Patch(':id/toggle-sunafil')
  async toggleSunafil(@Param('id') id: string, @Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN' && req.user.rol !== 'ADMIN') {
      throw new BadRequestException('No tienes permisos para modificar el monitoreo.');
    }
    return this.empresasService.toggleHabilitadoSunafil(id, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    if (req.user.rol !== 'SUPER_ADMIN' && req.user.rol !== 'ADMIN') {
      throw new BadRequestException('Solo administradores pueden eliminar empresas del sistema.');
    }
    return this.empresasService.remove(id, req.user.id);
  }

  /** Resetea empresas atascadas en SYNCING (útil cuando Render/backend se reinicia) */
  @Post('reset-stuck')
  resetStuck() {
    return this.empresasService.resetStuckSync();
  }
}
