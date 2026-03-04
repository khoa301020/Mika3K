import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuoteCommandProviders } from './commands';
import { QuoteEmbeds } from './quote.embeds';
import { Quote, QuoteSchema } from './quote.schema';
import { QuoteService } from './quote.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quote.name, schema: QuoteSchema }]),
  ],
  providers: [QuoteService, QuoteEmbeds, ...QuoteCommandProviders],
  exports: [QuoteService],
})
export class QuoteModule {}
