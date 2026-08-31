import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EtiquetasService } from './etiquetas.service';

@UseGuards(JwtAuthGuard)
@Controller('etiquetas')
export class EtiquetasController {
  constructor(private readonly etiquetasService: EtiquetasService) {}

  @Get()
  findAll() {
    return this.etiquetasService.findAll();
  }

  @Post()
  create(@Body() body: { nombre: string; color?: string }) {
    return this.etiquetasService.create(body.nombre, body.color);
  }

  @Post('asignar')
  asignar(@Body() body: { notificacionId: string; etiquetaId: string }) {
    return this.etiquetasService.asignar(body.notificacionId, body.etiquetaId);
  }

  @Delete(':etiquetaId/notificacion/:notifId')
  desasignar(
    @Param('etiquetaId') etiquetaId: string,
    @Param('notifId') notifId: string,
  ) {
    return this.etiquetasService.desasignar(notifId, etiquetaId);
  }
}
