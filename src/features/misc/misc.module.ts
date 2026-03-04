import { Module } from '@nestjs/common';
import { MiscCommandProviders } from './commands';
import { MiscEmbeds } from './misc.embeds';
import { MiscService } from './misc.service';

@Module({
  providers: [MiscService, MiscEmbeds, ...MiscCommandProviders],
  exports: [MiscService],
})
export class MiscModule {}
