import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Mika3K Admin API')
    .setDescription('REST API for Mika3K Discord bot administration')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Discord OAuth2 authentication')
    .addTag('Health', 'Bot health and statistics')
    .addTag('Guilds', 'Discord guild management')
    .addTag('HoYoLAB', 'HoYoLAB account and claim management')
    .addTag('NotifyChannels', 'Per-channel feature toggles')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
