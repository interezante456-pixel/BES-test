import { Module } from '@nestjs/common';
import { SunatScraperService } from './sunat/sunat-scraper.service';
import { SunatScraperProcessor } from './sunat/sunat-scraper.processor';
import { BullModule } from '@nestjs/bullmq';
import { CronService } from './cron.service';
import { EncryptionModule } from '../encryption/encryption.module';
import { PdfParserService } from './shared/pdf-parser.service';
import { BrowserService } from './shared/browser.service';
import { ScraperController } from './scraper.controller';
import { QueueController } from './queue.controller';
import { SunafilScraperService } from './sunafil/sunafil-scraper.service';
import { SunafilAuthService } from './sunafil/sunafil-auth.service';
import { SunafilDownloaderService } from './sunafil/sunafil-downloader.service';

@Module({
  imports: [
    EncryptionModule,
    BullModule.registerQueue({
      name: 'sunat-scraper-queue',
      streams: {
        events: {
          maxLen: 100,
        },
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000,
        },
        removeOnComplete: true,
      },
    }),
  ],
  controllers: [ScraperController, QueueController],
  providers: [
    BrowserService,
    SunatScraperService,
    SunatScraperProcessor,
    CronService,
    PdfParserService,
    SunafilScraperService,
    SunafilAuthService,
    SunafilDownloaderService,
  ],
  exports: [
    BrowserService,
    SunatScraperService,
    PdfParserService,
    SunafilScraperService,
    SunafilAuthService,
    SunafilDownloaderService,
  ],
})
export class ScraperModule {}


