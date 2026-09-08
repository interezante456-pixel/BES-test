import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { SunafilScraperService } from './sunafil-scraper.service';
import { EventsGateway } from '../../events/events.gateway';

@Processor('sunafil-scraper-queue', {
  concurrency: 1,
  lockDuration: 300000, // 5 minutos por empresa
  maxStalledCount: 5,
})
export class SunafilScraperProcessor extends WorkerHost {
  private readonly logger = new Logger(SunafilScraperProcessor.name);

  constructor(
    private readonly sunafilScraperService: SunafilScraperService,
    private readonly eventsGateway: EventsGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { empresaId, usuarioId, callerUserId } = job.data;
    const notifyUserId = callerUserId || usuarioId;

    this.logger.log(
      `[SUNAFIL Worker] Procesando tarea para empresa ${empresaId}...`,
    );

    try {
      const result = await this.sunafilScraperService.sincronizarEmpresa(empresaId, {
        descargarPdfs: false,
      });

      this.logger.log(
        `[SUNAFIL Worker] Sincronización exitosa para empresa ${empresaId}.`,
      );

      if (notifyUserId) {
        this.eventsGateway.emitToUser(notifyUserId, 'sync-finished', {
          empresaId,
          portal: 'SUNAFIL',
          status: 'success',
          result,
        });
      }

      return result;
    } catch (error: any) {
      this.logger.error(
        `[SUNAFIL Worker] Falló sincronización SUNAFIL para empresa ${empresaId}: ${error.message}`,
      );

      if (notifyUserId) {
        this.eventsGateway.emitToUser(notifyUserId, 'sync-error', {
          empresaId,
          portal: 'SUNAFIL',
          status: 'error',
          message: error.message,
        });
      }

      throw error;
    }
  }
}
