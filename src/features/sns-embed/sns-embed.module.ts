import { Module } from '@nestjs/common';
import { SnsEmbedEvents } from './sns-embed.events';
import { AppHttpModule } from '../../shared/http';

@Module({
  imports: [AppHttpModule],
  providers: [SnsEmbedEvents],
})
export class SnsEmbedModule {}
