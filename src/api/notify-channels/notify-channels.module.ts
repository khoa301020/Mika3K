import { Module } from '@nestjs/common';
import { NotifyChannelsController } from './notify-channels.controller';
import { NotifyChannelModule } from '../../shared/notify-channel';

@Module({
  imports: [NotifyChannelModule],
  controllers: [NotifyChannelsController],
})
export class NotifyChannelsApiModule {}
