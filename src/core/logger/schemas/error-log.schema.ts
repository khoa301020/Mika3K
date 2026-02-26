import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ErrorLogDocument = ErrorLog & Document;

@Schema({ timestamps: true, collection: 'error_logs' })
export class ErrorLog {
  @Prop({ required: true })
  message: string;

  @Prop()
  stack?: string;

  @Prop()
  context?: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog);
