import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EncryptionModule } from './encryption/encryption.module';
import { ScraperModule } from './scraper/scraper.module';
import { PrismaModule } from './prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { EmpresasModule } from './empresas/empresas.module';
import { AuthModule } from './auth/auth.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { EventsModule } from './events/events.module';
import { MailModule } from './mail/mail.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { RecordatoriosModule } from './recordatorios/recordatorios.module';
import { EtiquetasModule } from './etiquetas/etiquetas.module';
import { ReportesModule } from './reportes/reportes.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuditModule } from './audit/audit.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    // C8: Validación estricta de variables de entorno al arranque
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        ENCRYPTION_KEY: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        PUPPETEER_HEADLESS: Joi.boolean().default(true),
        PORT: Joi.number().default(3000),
        BACKEND_URL: Joi.string().uri().required(),
        FRONTEND_URL: Joi.string().uri().required(),
        TELEGRAM_BOT_TOKEN: Joi.string().optional(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    // C5: Rate Limiting global — máx 100 peticiones por minuto por IP
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000,
      limit: 100,
    }]),
    HealthModule,
    AuditModule,
    UploadsModule,
    ScheduleModule.forRoot(),
    PrismaModule,
    EncryptionModule,
    ScraperModule,
    EventsModule,
    MailModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
      },
    }),
    BullModule.registerQueue({
      name: 'sunat-scraper-queue',
    }),
    EmpresasModule,
    AuthModule,
    NotificacionesModule,
    UsuariosModule,
    AsignacionesModule,
    EstadisticasModule,
    RecordatoriosModule,
    EtiquetasModule,
    ReportesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // C5: Aplicar ThrottlerGuard globalmente
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
