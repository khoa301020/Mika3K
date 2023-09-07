import mongoose from 'mongoose';
import { IUserQuote } from '../types/quote.js';
import { randomArray } from '../utils/index.js';

const QuoteSchema = new mongoose.Schema(
  {
    guild: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    quote: {
      type: {
        key: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: false,
        },
        embeds: {
          type: Array,
          required: false,
        },
      },
    },
    hits: {
      type: Object,
      required: false,
    },
    private: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
  {
    statics: {
      async getRandomQuote(keyword: string, guildId: string, userId: string) {
        const query = mongoose.Types.ObjectId.isValid(keyword)
          ? { _id: keyword }
          : { 'quote.key': { $regex: `^${keyword}$`, $options: 'i' } };
        const quotes = await this.find({ ...query, guild: guildId }).lean();
        if (quotes.length === 0) return null;
        const filteredQuotes = quotes.filter((quote) => !quote.private || quote.user === userId);
        const quote = randomArray(filteredQuotes.length === 0 ? quotes : filteredQuotes);
        if (!quote.private || quote.user === userId)
          await this.updateOne({ _id: quote._id }, { $inc: { [`hits.${userId}`]: 1 } });
        quote.isOnly = filteredQuotes.length <= 1 && quotes.length <= 1;
        return quote as Required<IUserQuote>;
      },
    },
  },
);

const Quote = mongoose.model('Quote', QuoteSchema, 'quotes');

export default Quote;
