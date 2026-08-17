import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { PrismaExceptionFilter } from './prisma-exception.filter';

async function bootstrap() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV ?? 'development',
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    });
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const uploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
  mkdirSync(uploadsDir, { recursive: true });

  app.enableCors({
    origin: [
      'https://www.aluprofile.biz',
      'https://aluprofile.biz',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
      /^https:\/\/.*\.aluprofile\.biz$/,
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.railway\.app$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'sentry-trace', 'baggage'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useStaticAssets(uploadsDir, { prefix: '/uploads/' });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
