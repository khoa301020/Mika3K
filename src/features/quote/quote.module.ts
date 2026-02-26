import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quote, QuoteSchema } from './quote.schema';
import { QuoteService } from './quote.service';
import { QuoteCommands } from './quote.commands';
import { QuoteEmbeds } from './quote.embeds';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quote.name, schema: QuoteSchema }]),
  ],
  providers: [QuoteService, QuoteCommands, QuoteEmbeds],
  exports: [QuoteService],
})
export class QuoteModule {}
