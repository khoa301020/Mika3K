import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// NotifyChannel schema — shared, used by BA cron
@Schema({ collection: 'NotifyChannels' })
export class NotifyChannel {
  @Prop() guildId: string;
  @Prop() channelId: string;
  @Prop() notifyType: string;
}
export type NotifyChannelDocument = HydratedDocument<NotifyChannel>;
export const NotifyChannelSchema = SchemaFactory.createForClass(NotifyChannel);

// SchaleDB schemas are registered on a separate connection (MONGO_URI_BA).

// These schemas are registered imperatively in ba.module.ts using MongooseModule.forFeature
// with the 'ba' connection name. We export plain schema definition objects.
export const SCHALE_COLLECTIONS = [
  'Students',
  'Currencies',
  'Enemies',
  'Equipments',
  'Furnitures',
  'Items',
  'Raids',
  'RaidSeasons',
  'TimeAttacks',
  'WorldRaids',
  'MultiFloorRaids',
  'Summons',
] as const;
