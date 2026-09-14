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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateGestionDto, CreateComentarioDto } from './dto/update-gestion.dto';

@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  /** Listar notificaciones asignadas al usuario actual */
  @Get('mis-asignadas')
  findMisAsignadas(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('estadoGestion') estadoGestion?: string,
    @Query('search') search?: string,
  ) {
    return this.notificacionesService.findMisAsignadas(
      req.user.id,
      req.user.rol,
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 25,
        estadoGestion,
        search,
      },
    );
  }

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
    @Query('origen') origen?: string,
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
        origen: origen || 'SUNAT',
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
    @Query('origen') origen?: string,
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
        origen: origen || 'SUNAT',
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

  /** Marcar una notificación como leída globalmente (todos dejarán de verla en bandeja) */
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificacionesService.markAsRead(id, req.user.id);
  }

  /** Marcar TODAS como leídas globalmente para el portal correspondiente */
  @Patch('mark-all-read')
  markAllAsRead(@Request() req: any, @Query('origen') origen?: string) {
    return this.notificacionesService.markAllAsRead(
      req.user.id,
      req.user.rol,
      origen || 'SUNAT',
    );
  }

  /** Actualizar estado de gestión, responsable, notas o compromiso */
  @Patch(':id/gestion')
  updateGestion(
    @Param('id') id: string,
    @Body() dto: UpdateGestionDto,
    @Request() req: any,
  ) {
    return this.notificacionesService.updateGestion(
      id,
      req.user.id,
      req.user.rol,
      dto,
    );
  }

  /** Obtener comentarios e historial de cambios de una notificación */
  @Get(':id/comentarios')
  getComentarios(@Param('id') id: string, @Request() req: any) {
    return this.notificacionesService.getComentarios(
      id,
      req.user.id,
      req.user.rol,
    );
  }

  /** Agregar un comentario/nota a la bitácora de una notificación */
  @Post(':id/comentarios')
  addComentario(
    @Param('id') id: string,
    @Body() dto: CreateComentarioDto,
    @Request() req: any,
  ) {
    return this.notificacionesService.addComentario(
      id,
      req.user.id,
      req.user.rol,
      dto,
    );
  }

  /** Historial de auditoría: quién y cuándo abrió una notificación */
  @Get(':id/historial')
  getReadHistory(@Param('id') id: string) {
    return this.notificacionesService.getReadHistory(id);
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

  /** Subir un PDF manualmente para una notificación */
  @Post(':id/pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  uploadPdf(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    return this.notificacionesService.uploadManualPdf(
      id,
      file,
      req.user.id,
      req.user.rol,
    );
  }
}
