import { Global, Module } from '@nestjs/common';
import { EmbedService } from './embed.service';

@Global()
@Module({
  providers: [EmbedService],
  exports: [EmbedService],
})
export class EmbedModule {}
