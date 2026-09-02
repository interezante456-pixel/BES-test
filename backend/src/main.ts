import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // A3: Configuración de CORS dinámica para permitir localhost, dominios y redes locales con cualquier puerto
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permitir peticiones del mismo servidor (sin header origin) o desde dominios/IPs autorizadas
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('oracon.com') ||
        origin.includes('bes.com') ||
        /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        // A5: Rechazar orígenes no autorizados explícitamente
        callback(new Error('Origen no permitido por política CORS'));
      }
    },
    credentials: true,
  });

  // A5: Validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,          // Elimina propiedades no declaradas en el DTO
    transform: true,          // Transforma automáticamente tipos primitivos
    transformOptions: { enableImplicitConversion: true },
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

