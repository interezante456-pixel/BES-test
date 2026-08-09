import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { ScraperModule } from '../scraper/scraper.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [ScraperModule, CommonModule],
  controllers: [NotificacionesController],
  providers: [NotificacionesService],
})
export class NotificacionesModule {}
