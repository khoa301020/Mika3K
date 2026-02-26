import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NotifyChannel,
  NotifyChannelDocument,
  NotifyType,
} from './notify-channel.schema';

@Injectable()
export class NotifyChannelService {
  constructor(
    @InjectModel(NotifyChannel.name)
    private readonly notifyChannelModel: Model<NotifyChannelDocument>,
  ) {}

  async isChannelEnabled(
    channelId: string,
    notifyType: NotifyType,
  ): Promise<boolean> {
    return !!(await this.notifyChannelModel.exists({ channelId, notifyType }));
  }

  async enableChannel(
    guildId: string,
    channelId: string,
    notifyType: NotifyType,
  ): Promise<NotifyChannelDocument> {
    return await this.notifyChannelModel.findOneAndUpdate(
      { channelId, notifyType },
      { $set: { guildId, channelId, notifyType } },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async disableChannel(
    channelId: string,
    notifyType: NotifyType,
  ): Promise<void> {
    await this.notifyChannelModel.deleteOne({ channelId, notifyType });
  }

  async findAll(): Promise<NotifyChannelDocument[]> {
    return this.notifyChannelModel.find().lean();
  }
}
