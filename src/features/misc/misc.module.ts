import { Module } from '@nestjs/common';
import { MiscService } from './misc.service';
import { MiscCommands } from './misc.commands';
import { MiscEmbeds } from './misc.embeds';

@Module({
  providers: [MiscService, MiscCommands, MiscEmbeds],
  exports: [MiscService],
})
export class MiscModule {}
