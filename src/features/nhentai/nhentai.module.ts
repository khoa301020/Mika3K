import { Module } from '@nestjs/common';
import { AppCacheModule } from '../../shared/cache';
import { AppHttpModule } from '../../shared/http';
import { NotifyChannelModule } from '../../shared/notify-channel';
import { NHentaiCommandProviders } from './commands';
import { NHentaiEvents } from './nhentai.events';
import { NHentaiService } from './nhentai.service';

@Module({
  imports: [AppHttpModule, AppCacheModule, NotifyChannelModule],
  providers: [NHentaiService, NHentaiEvents, ...NHentaiCommandProviders],
  exports: [NHentaiService],
})
export class NHentaiModule {}
