import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SyosetuDocument = HydratedDocument<Syosetu>;

@Schema({ _id: false })
export class SyosetuMetadata {
  @Prop()
  title: string;

  @Prop()
  writer: string;

  @Prop()
  story: string;

  @Prop()
  general_firstup: Date;

  @Prop()
  general_lastup: Date;

  @Prop()
  novel_type: number;

  @Prop()
  end: number;

  @Prop()
  general_all_no: number;

  @Prop()
  length: number;

  @Prop()
  time: number;

  @Prop()
  novelupdated_at: Date;
}

@Schema({ _id: false })
export class SyosetuFollowings {
  @Prop({ type: [String], default: [] })
  users: Array<string>;

  @Prop({ type: [String], default: [] })
  channels: Array<string>;
}

@Schema({ collection: 'Syosetu', timestamps: true, toJSON: { virtuals: true } })
export class Syosetu {
  @Prop({ required: true, unique: true })
  ncode: string;

  @Prop({ type: SyosetuMetadata })
  metadata: SyosetuMetadata;

  @Prop({ type: SyosetuFollowings })
  followings: SyosetuFollowings;

  @Prop({ default: Date.now })
  lastSystemUpdate: Date;
}

export const SyosetuSchema = SchemaFactory.createForClass(Syosetu);
