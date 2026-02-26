import { Module } from '@nestjs/common';
import { NHentaiService } from './nhentai.service';
import { NHentaiEvents } from './nhentai.events';
import { NHentaiCommands } from './nhentai.commands';
import { AppHttpModule } from '../../shared/http';
import { AppCacheModule } from '../../shared/cache';
import { NotifyChannelModule } from '../../shared/notify-channel';

@Module({
  imports: [AppHttpModule, AppCacheModule, NotifyChannelModule],
  providers: [NHentaiService, NHentaiEvents, NHentaiCommands],
  exports: [NHentaiService],
})
export class NHentaiModule {}
