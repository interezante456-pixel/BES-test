import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecordatoriosService } from './recordatorios.service';

@UseGuards(JwtAuthGuard)
@Controller('recordatorios')
export class RecordatoriosController {
  constructor(private readonly recordatoriosService: RecordatoriosService) {}

  @Get()
  findMine(@Request() req: any) {
    return this.recordatoriosService.findByUser(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: any) {
    return this.recordatoriosService.create(req.user.id, dto);
  }

  @Patch(':id/completar')
  toggleCompletado(@Request() req: any, @Param('id') id: string) {
    return this.recordatoriosService.toggleCompletado(id, req.user.id);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.recordatoriosService.remove(id, req.user.id);
  }
}
