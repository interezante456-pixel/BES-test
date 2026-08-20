import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from '../prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export class ScheduleConfigDto {
  sincroAutomaticaActiva!: boolean;
  diasSemana!: number[]; // 0=Dom, 1=Lun, ..., 6=Sáb
  horas!: string[]; // ['06:00', '18:00']
}

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);
  private readonly JOB_PREFIX = 'dynamic-sunat-sync-';

  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @InjectQueue('sunat-scraper-queue') private readonly scraperQueue: Queue,
  ) {}

  async onModuleInit() {
    this.logger.log('Inicializando programador de tareas automáticas...');
    try {
      const config = await this.getOrCreateConfig();
      await this.reloadCronJobs(config);
    } catch (error) {
      this.logger.error('Error al inicializar tareas automáticas:', error);
    }
  }

  async getOrCreateConfig() {
    let config = await this.prisma.configuracionSistema.findUnique({
      where: { id: 'default' },
    });

    if (!config) {
      config = await this.prisma.configuracionSistema.create({
        data: {
          id: 'default',
          sincroAutomaticaActiva: true,
          diasSemana: [0, 1, 2, 3, 4, 5, 6],
          horas: ['06:00', '18:00'],
        },
      });
    }

    return config;
  }

  async updateScheduleConfig(data: ScheduleConfigDto) {
    // Normalizar y validar horas
    const horasLimpias = Array.from(
      new Set(
        (data.horas || [])
          .map((h) => h.trim())
          .filter((h) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(h)),
      ),
    ).sort();

    // Normalizar días (0 a 6)
    const diasLimpios = Array.from(
      new Set(
        (data.diasSemana || []).filter(
          (d) => Number.isInteger(d) && d >= 0 && d <= 6,
        ),
      ),
    ).sort((a, b) => a - b);

    const updated = await this.prisma.configuracionSistema.upsert({
      where: { id: 'default' },
      update: {
        sincroAutomaticaActiva: data.sincroAutomaticaActiva ?? true,
        diasSemana:
          diasLimpios.length > 0 ? diasLimpios : [0, 1, 2, 3, 4, 5, 6],
        horas: horasLimpias.length > 0 ? horasLimpias : ['06:00', '18:00'],
      },
      create: {
        id: 'default',
        sincroAutomaticaActiva: data.sincroAutomaticaActiva ?? true,
        diasSemana:
          diasLimpios.length > 0 ? diasLimpios : [0, 1, 2, 3, 4, 5, 6],
        horas: horasLimpias.length > 0 ? horasLimpias : ['06:00', '18:00'],
      },
    });

    await this.reloadCronJobs(updated);
    return updated;
  }

  async reloadCronJobs(config: {
    sincroAutomaticaActiva: boolean;
    diasSemana: number[];
    horas: string[];
  }) {
    // 1. Limpiar jobs previos registrados dinámicamente
    this.clearDynamicCronJobs();

    if (!config.sincroAutomaticaActiva) {
      this.logger.warn(
        '⏸️ Sincronización automática desactivada por configuración.',
      );
      return;
    }

    if (config.horas.length === 0 || config.diasSemana.length === 0) {
      this.logger.warn(
        '⚠️ No hay horas o días configurados para la sincronización.',
      );
      return;
    }

    // Días en formato cron: ej. "1,2,3,4,5" o "*"
    const diasCron =
      config.diasSemana.length === 7 ? '*' : config.diasSemana.join(',');

    config.horas.forEach((horaStr, index) => {
      const [hh, mm] = horaStr.split(':');
      const minute = parseInt(mm, 10);
      const hour = parseInt(hh, 10);

      // Cron: '0 <minuto> <hora> * * <dias>'
      const cronTime = `0 ${minute} ${hour} * * ${diasCron}`;
      const jobName = `${this.JOB_PREFIX}${index}-${horaStr.replace(':', '')}`;

      try {
        const job = new CronJob(
          cronTime,
          () => {
            this.logger.log(
              `⏰ Ejecutando sincronización automática programada [${jobName}] (${horaStr} - Días: ${diasCron})`,
            );
            this.handleDailyScraping();
          },
          null,
          false,
          'America/Lima',
        );

        this.schedulerRegistry.addCronJob(jobName, job);
        job.start();
        this.logger.log(
          `✓ Cron programado: [${jobName}] -> "${cronTime}" (Hora Perú)`,
        );
      } catch (err) {
        this.logger.error(`Error registrando cron job [${jobName}]:`, err);
      }
    });
  }

  private clearDynamicCronJobs() {
    try {
      const jobs = this.schedulerRegistry.getCronJobs();
      for (const [name, job] of jobs.entries()) {
        if (name.startsWith(this.JOB_PREFIX)) {
          job.stop();
          this.schedulerRegistry.deleteCronJob(name);
          this.logger.log(`- Cron previo removido: ${name}`);
        }
      }
    } catch (e) {
      this.logger.error('Error al limpiar cron jobs anteriores:', e);
    }
  }

  async handleDailyScraping() {
    this.logger.log('Iniciando encolamiento programado de sincronización masiva...');

    try {
      const empresas = await this.prisma.empresa.findMany({
        where: { activo: true, habilitadoSunat: true },
        select: { id: true, ruc: true, usuarioId: true },
      });

      this.logger.log(
        `Se encontraron ${empresas.length} empresas activas y habilitadas en SUNAT para procesar en el barrido programado.`,
      );

      if (empresas.length === 0) return;

      // Delay escalonado suave: 2 segundos entre encolamientos para no saturar Redis de golpe
      const DELAY_ENTRE_EMPRESAS_MS = 2000; // 2 segundos

      for (let i = 0; i < empresas.length; i++) {
        const empresa = empresas[i];
        const delayMs = i * DELAY_ENTRE_EMPRESAS_MS;

        await this.scraperQueue.add(
          'scrape-sunat',
          {
            empresaId: empresa.id,
            usuarioId: empresa.usuarioId,
          },
          {
            jobId: `scheduled-${empresa.id}-${Date.now()}`,
            delay: delayMs, // Escalonado
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000 * 60 * 5, // 5 minutos entre reintentos
            },
          },
        );
        this.logger.log(
          `Tarea programada encolada para RUC: ${empresa.ruc} (inicia en ${delayMs / 1000}s)`,
        );
      }
    } catch (error) {
      this.logger.error('Error al encolar tareas programadas:', error);
    }
  }
}
