import { Module } from '@nestjs/common';
import { MalService } from './mal.service';
import { MalCommands } from './mal.commands';
import { MalEmbeds } from './mal.embeds';
import { ChartModule } from '../../shared/chart';

@Module({
  imports: [ChartModule],
  providers: [MalService, MalCommands, MalEmbeds],
  exports: [MalService],
})
export class MalModule {}
