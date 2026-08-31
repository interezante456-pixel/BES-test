import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EstadisticasService } from './estadisticas.service';

@UseGuards(JwtAuthGuard)
@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get()
  getStats(@Request() req: any) {
    return this.estadisticasService.getStats(req.user.id, req.user.rol);
  }

  @Get('morning-brief')
  getMorningBrief(@Request() req: any) {
    return this.estadisticasService.getMorningBrief(req.user.id, req.user.rol);
  }

  @Get('calendario')
  getCalendario(
    @Request() req: any,
    @Query('mes') mes?: string,
  ) {
    return this.estadisticasService.getCalendarioEventos(
      req.user.id,
      req.user.rol,
      mes,
    );
  }

  @Post('calendario')
  createEvento(
    @Request() req: any,
    @Body() dto: any,
  ) {
    return this.estadisticasService.createEventoCalendario(req.user.id, dto);
  }

  @Delete('calendario/:id')
  deleteEvento(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.estadisticasService.deleteEventoCalendario(
      id,
      req.user.id,
      req.user.rol,
    );
  }
}
