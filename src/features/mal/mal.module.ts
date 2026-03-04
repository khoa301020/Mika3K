import { Module } from '@nestjs/common';
import { ChartModule } from '../../shared/chart';
import { MalCommandProviders } from './commands';
import { MalEmbeds } from './mal.embeds';
import { MalService } from './mal.service';

@Module({
  imports: [ChartModule],
  providers: [MalService, MalEmbeds, ...MalCommandProviders],
  exports: [MalService],
})
export class MalModule {}
