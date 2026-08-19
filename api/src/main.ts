import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = (process.env.WEB_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}

bootstrap();
