import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotifyChannelDocument = HydratedDocument<NotifyChannel>;

import { NotifyType } from './notify-channel.enum';
@Schema({ collection: 'NotifyChannels', toJSON: { virtuals: true } })
export class NotifyChannel {
  @Prop()
  guildId: string;

  @Prop()
  channelId: string;

  @Prop({ type: String, enum: Object.values(NotifyType) })
  notifyType: NotifyType;
}

export const NotifyChannelSchema = SchemaFactory.createForClass(NotifyChannel);
