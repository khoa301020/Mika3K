import { Module } from '@nestjs/common';
import { PixivEvents } from './pixiv.events';
import { AppHttpModule } from '../../shared/http';

@Module({
  imports: [AppHttpModule],
  providers: [PixivEvents],
})
export class PixivModule {}
