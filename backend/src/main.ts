import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // A3: Restringir CORS solo a dominios conocidos
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3500',
    'http://panel.oracon.com',
    'http://panel.bes.com',
  ];
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origen no permitido: ${origin}`));
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

