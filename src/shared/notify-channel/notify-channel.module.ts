import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotifyChannel, NotifyChannelSchema } from './notify-channel.schema';
import { NotifyChannelService } from './notify-channel.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotifyChannel.name, schema: NotifyChannelSchema },
    ]),
  ],
  providers: [NotifyChannelService],
  exports: [NotifyChannelService, MongooseModule],
})
export class NotifyChannelModule {}
