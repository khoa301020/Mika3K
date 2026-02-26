import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupSwagger } from './api/swagger';

import { AppLoggerService } from './core/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Security Headers
  app.use(helmet());

  // Use custom logger globally
  const logger = await app.resolve(AppLoggerService);
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  // Tell our logger where we are conceptually
  logger.setContext('Bootstrap');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors();

  // Global prefix for REST API controllers
  app.setGlobalPrefix('api', {
    exclude: [], // Necord handles its own routes
  });

  // Swagger
  setupSwagger(app);

  // Start
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

void bootstrap();
