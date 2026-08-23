import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma.service';
import { SunatScraperService } from './sunat/sunat-scraper.service';
import { CronService, ScheduleConfigDto } from './cron.service';
import { SunafilScraperService } from './sunafil/sunafil-scraper.service';

@UseGuards(JwtAuthGuard)
@Controller('scraper')
export class ScraperController {
  constructor(
    @InjectQueue('sunat-scraper-queue') private scraperQueue: Queue,
    private prisma: PrismaService,
    private sunatScraperService: SunatScraperService,
    private cronService: CronService,
    private sunafilScraperService: SunafilScraperService,
  ) {}

  @Get('schedule')
  async getSchedule(@Request() req: any) {
    const { rol } = req.user;
    if (rol !== 'SUPER_ADMIN' && rol !== 'ADMIN') {
      throw new ForbiddenException('Solo administradores pueden ver la programación');
    }
    return this.cronService.getOrCreateConfig();
  }

  @Put('schedule')
  async updateSchedule(@Body() body: ScheduleConfigDto, @Request() req: any) {
    const { rol } = req.user;
    if (rol !== 'SUPER_ADMIN' && rol !== 'ADMIN') {
      throw new ForbiddenException('Solo administradores pueden modificar la programación');
    }
    return this.cronService.updateScheduleConfig(body);
  }

  @Post('sync/:empresaId')
  async syncEmpresa(
    @Param('empresaId') empresaId: string,
    @Request() req: any,
  ) {
    const { id: callerId, rol } = req.user;
    let empresa: any = null;

    if (rol === 'SUPER_ADMIN' || rol === 'ADMIN') {
      // SUPER_ADMIN y ADMIN pueden sincronizar cualquier empresa del sistema
      empresa = await this.prisma.empresa.findFirst({
        where: { id: empresaId },
      });
    } else {
      // USUARIO_LOCAL: solo puede sincronizar las que tiene asignadas
      const asignacion = await this.prisma.empresaAsignacion.findFirst({
        where: { usuarioId: callerId, empresaId },
        include: { empresa: true },
      });
      if (asignacion) empresa = asignacion.empresa;
    }

    if (!empresa) {
      throw new ForbiddenException(
        'Empresa no encontrada o no tienes permiso para sincronizarla',
      );
    }

    if (empresa.activo === false) {
      throw new ForbiddenException(
        'La empresa se encuentra deshabilitada',
      );
    }

    // ownerUserId = quien recibe el email (SUPER_ADMIN dueño)
    // callerId    = quien recibe el WebSocket (el que hizo clic)
    await this.scraperQueue.add(
      'scrape-sunat',
      {
        empresaId,
        usuarioId: empresa.usuarioId, // para el email y logs
        callerUserId: callerId, // para el WebSocket de progreso
      },
      { priority: 1 },
    );

    return { message: 'Sincronización encolada', status: 'pending' };
  }

  @Post('sync-all')
  async syncAllEmpresas(@Request() req: any) {
    const { id: callerId, rol } = req.user;
    let empresas: any[] = [];

    if (rol === 'SUPER_ADMIN' || rol === 'ADMIN') {
      // SUPER_ADMIN y ADMIN sincronizan todas las empresas ACTIVAS del sistema
      empresas = await this.prisma.empresa.findMany({
        where: { activo: true },
        select: { id: true, usuarioId: true },
      });
    } else {
      // USUARIO_LOCAL: solo las asignadas que estén ACTIVAS
      const asignaciones = await this.prisma.empresaAsignacion.findMany({
        where: { usuarioId: callerId, empresa: { activo: true } },
        include: { empresa: { select: { id: true, usuarioId: true } } },
      });
      empresas = asignaciones.map((a) => a.empresa);
    }

    if (!empresas || empresas.length === 0) {
      return { message: 'No hay empresas para sincronizar', count: 0 };
    }

    const jobs = empresas.map((empresa) => ({
      name: 'scrape-sunat',
      data: {
        empresaId: empresa.id,
        usuarioId: empresa.usuarioId, // para el email
        callerUserId: callerId, // para el WebSocket
      },
      opts: { priority: 2 },
    }));

    await this.scraperQueue.addBulk(jobs);

    return {
      message: 'Sincronización masiva encolada',
      count: empresas.length,
    };
  }

  @Post('clear-queue')
  async clearQueue(@Request() req: any) {
    const { rol } = req.user;
    if (rol !== 'SUPER_ADMIN' && rol !== 'ADMIN') {
      throw new ForbiddenException(
        'Solo los administradores pueden vaciar la cola de tareas',
      );
    }

    // Vaciar y limpiar la cola
    await this.scraperQueue.drain(true);
    await this.scraperQueue.clean(0, 1000, 'active');
    await this.scraperQueue.clean(0, 1000, 'wait');
    await this.scraperQueue.clean(0, 1000, 'delayed');
    await this.scraperQueue.clean(0, 1000, 'paused');
    await this.scraperQueue.clean(0, 1000, 'failed');

    return {
      message: 'Cola de tareas de scraping limpiada y cancelada con éxito',
    };
  }

  @Post('fix-asuntos')
  async fixAsuntos(@Request() req: any) {
    const { rol } = req.user;
    if (rol !== 'SUPER_ADMIN' && rol !== 'ADMIN') {
      throw new ForbiddenException('Solo administradores pueden ejecutar esta operación');
    }
    return this.sunatScraperService.fixCorruptAsuntos();
  }

  @Post('retry-pdf/:notificacionId')
  async retryPdf(
    @Param('notificacionId') notificacionId: string,
    @Request() req: any,
  ) {
    const { rol } = req.user;
    if (rol !== 'SUPER_ADMIN' && rol !== 'ADMIN') {
      throw new ForbiddenException('Solo administradores pueden reintentar PDFs');
    }
    return this.sunatScraperService.retryPdf(notificacionId);
  }

  @Post('sync-sunafil/:empresaId')
  async syncSunafil(
    @Param('empresaId') empresaId: string,
    @Request() req: any,
  ) {
    const { id: callerId, rol } = req.user;
    let empresa: any = null;

    if (rol === 'SUPER_ADMIN' || rol === 'ADMIN') {
      empresa = await this.prisma.empresa.findFirst({
        where: { id: empresaId },
      });
    } else {
      const asignacion = await this.prisma.empresaAsignacion.findFirst({
        where: { usuarioId: callerId, empresaId },
        include: { empresa: true },
      });
      if (asignacion) empresa = asignacion.empresa;
    }

    if (!empresa) {
      throw new ForbiddenException(
        'Empresa no encontrada o no tienes permiso para sincronizarla',
      );
    }

    // Ejecutar sincronización de SUNAFIL de forma asíncrona / directa
    return this.sunafilScraperService.sincronizarEmpresa(empresaId, {
      descargarPdfs: false,
    });
  }
}

