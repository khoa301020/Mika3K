import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QuoteDocument = HydratedDocument<Quote>;

@Schema({ collection: 'quotes' })
export class Quote {
  @Prop({ required: true })
  guild: string;

  @Prop({ required: true })
  user: string;

  @Prop({ type: Object })
  quote: {
    key: string;
    value?: string;
    embeds?: any[];
  };

  @Prop({ type: Object, default: {} })
  hits: Record<string, number>;

  @Prop({ default: false })
  private: boolean;

  @Prop({ required: true, default: () => new Date() })
  createdAt: Date;
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);
