import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ClaimHistoryDocument = HydratedDocument<ClaimHistory>;

@Schema({ collection: 'ClaimHistory', timestamps: true })
export class ClaimHistory {
  @Prop({ type: Types.ObjectId, ref: 'Hoyolab' })
  hoyolabUserId: Types.ObjectId;

  @Prop()
  game: string;

  @Prop()
  gameUid: string;

  @Prop()
  nickname: string;

  @Prop({ enum: ['success', 'already_claimed', 'failed'] })
  status: string;

  @Prop()
  message: string;

  @Prop()
  reward?: string;

  @Prop({ default: () => new Date() })
  claimedAt: Date;

  @Prop({ default: false })
  isManual: boolean;
}

export const ClaimHistorySchema = SchemaFactory.createForClass(ClaimHistory);
