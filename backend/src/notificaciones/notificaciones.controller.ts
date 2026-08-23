import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
  Delete,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  /** Bandeja de entrada — notificaciones sin leer para este usuario */
  @Get()
  findBandeja(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('empresa') empresa?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.notificacionesService.findBandejaByUser(
      req.user.id,
      req.user.rol,
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
        empresa,
        search,
        startDate,
        endDate,
      },
    );
  }

  /** Archivo — notificaciones ya leídas por este usuario */
  @Get('archivo')
  findArchivo(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('empresa') empresa?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.notificacionesService.findArchivoByUser(
      req.user.id,
      req.user.rol,
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
        empresa,
        search,
        startDate,
        endDate,
      },
    );
  }

  /** SUNAFIL — Métricas y contadores de los 5 módulos */
  @Get('sunafil/metricas')
  getSunafilMetricas(
    @Request() req: any,
    @Query('empresa') empresa?: string,
  ) {
    return this.notificacionesService.getSunafilMetricas(
      req.user.id,
      req.user.rol,
      empresa,
    );
  }

  /** SUNAFIL — Listado especializado con filtros por módulo, empresa y fechas */
  @Get('sunafil')
  findSunafil(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('empresa') empresa?: string,
    @Query('modulo') modulo?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('estado') estado?: string,
  ) {
    return this.notificacionesService.findSunafilNotificaciones(
      req.user.id,
      req.user.rol,
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
        empresa,
        modulo,
        search,
        startDate,
        endDate,
        estado,
      },
    );
  }

  /** Marcar una notificación como leída (solo para este usuario) */
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificacionesService.markAsRead(id, req.user.id);
  }

  /** Marcar TODAS como leídas (solo para este usuario) */
  @Patch('mark-all-read')
  markAllAsRead(@Request() req: any) {
    return this.notificacionesService.markAllAsRead(req.user.id, req.user.rol);
  }

  /** Eliminar múltiples notificaciones (SUPER_ADMIN/ADMIN) */
  @Post('bulk-delete')
  removeMany(@Body('ids') ids: string[], @Request() req: any) {
    return this.notificacionesService.removeMany(
      ids,
      req.user.id,
      req.user.rol,
    );
  }

  /** Eliminar una notificación (SUPER_ADMIN/ADMIN) + PDF del disco */
  @Delete(':id')
  removeOne(@Param('id') id: string, @Request() req: any) {
    return this.notificacionesService.removeOne(id, req.user.id, req.user.rol);
  }

  /** Eliminar todas (SUPER_ADMIN/ADMIN) */
  @Delete()
  removeAll(@Request() req: any) {
    return this.notificacionesService.removeAllByUser(
      req.user.id,
      req.user.rol,
    );
  }
}
