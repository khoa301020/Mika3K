import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IHoYoLABUser } from './types/hoyolab';

export type HoyolabDocument = Hoyolab & Document;

@Schema({ collection: 'HoYoLAB', toJSON: { virtuals: true } })
export class Hoyolab {
  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ required: false, type: Date })
  expiresAt?: Date | null;

  @Prop({ type: Array, required: true })
  hoyoUsers: IHoYoLABUser[];

  @Prop({ required: false, default: true, type: Boolean })
  receiveNotify?: boolean;

  @Prop({ required: false, default: true, type: Boolean })
  dailyClaimDmEnabled?: boolean;
}

export const HoyolabSchema = SchemaFactory.createForClass(Hoyolab);
