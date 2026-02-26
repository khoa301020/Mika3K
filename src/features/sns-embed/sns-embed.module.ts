import { Module } from '@nestjs/common';
import { SnsEmbedEvents } from './sns-embed.events';
import { SnsEmbedService } from './sns-embed.service';
import { AppHttpModule } from '../../shared/http';

@Module({
  imports: [AppHttpModule],
  providers: [SnsEmbedEvents, SnsEmbedService],
})
export class SnsEmbedModule {}
