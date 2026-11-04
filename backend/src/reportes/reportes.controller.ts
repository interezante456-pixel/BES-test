import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportesService } from './reportes.service';

@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('empresa/:empresaId/mensual')
  getReporteMensual(
    @Param('empresaId') empresaId: string,
    @Query('mes') mes?: string,
  ) {
    return this.reportesService.getReporteMensualEmpresa(empresaId, mes);
  }

  @Get('deuda-exigible')
  getReporteDeuda(@Request() req: any) {
    return this.reportesService.getReporteDeudaExigible(req.user.id, req.user.rol);
  }

  @Get('vencimientos')
  getReporteVencimientos(
    @Request() req: any,
    @Query('dias') dias?: string,
  ) {
    return this.reportesService.getReporteVencimientos(
      req.user.id,
      req.user.rol,
      dias ? Number.parseInt(dias, 10) : 30,
    );
  }
}
