import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
    DeliveryProvider,
    DeliveryStatus,
    IBroadcastTarget,
    ITrackingRecord,
} from '../delivery-tracker.types';

export type DeliveryTrackerDocument = DeliveryTracker & Document;

@Schema({ collection: 'DeliveryTrackers', timestamps: true })
export class DeliveryTracker {
  @Prop({ required: true, type: String })
  trackingCode: string;

  @Prop({ required: true, type: String, enum: DeliveryProvider })
  provider: DeliveryProvider;

  @Prop({ required: true, type: String })
  remark: string;

  @Prop({ required: true, type: String, index: true })
  ownerId: string;

  @Prop({ type: Array, default: [] })
  broadcastTargets: IBroadcastTarget[];

  @Prop({ type: Array, default: [] })
  records: ITrackingRecord[];

  @Prop({
    required: true,
    type: String,
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  lastKnownStatus: DeliveryStatus;

  @Prop({ type: Date, default: null })
  lastPolledAt: Date;

  @Prop({ type: Date, default: null })
  lastUpdatedAt: Date;

  @Prop({ required: true, type: Boolean, default: false })
  isEnded: boolean;

  @Prop({ required: true, type: Boolean, default: false })
  isFailed: boolean;

  @Prop({ type: Object, default: {} })
  providerMeta: Record<string, any>;
}

export const DeliveryTrackerSchema =
  SchemaFactory.createForClass(DeliveryTracker);

// Compound unique: one doc per code per owner
DeliveryTrackerSchema.index({ trackingCode: 1, ownerId: 1 }, { unique: true });

// For cron polling queries
DeliveryTrackerSchema.index({ isEnded: 1, isFailed: 1, provider: 1 });
