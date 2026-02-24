import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quote, QuoteDocument } from './quote.schema';
import { randomArray } from '../../shared/utils';

export type QuoteSort = 'key' | 'hits';

const SORT_FIELD_MAP: Record<QuoteSort, string> = {
  key: 'quote.key',
  hits: 'sumHits',
};

@Injectable()
export class QuoteService {
  constructor(
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
  ) {}

  async create(data: {
    guild: string;
    user: string;
    quote: { key: string; value?: string; embeds?: any[] };
    private?: boolean;
  }): Promise<QuoteDocument> {
    return this.quoteModel.create({ ...data, createdAt: new Date() });
  }

  async getRandomQuote(keyword: string, guildId: string, userId: string) {
    const query = Types.ObjectId.isValid(keyword)
      ? { _id: keyword }
      : { 'quote.key': { $regex: `^${keyword}$`, $options: 'i' } };

    const quotes = await this.quoteModel
      .find({ ...query, guild: guildId })
      .lean();
    if (quotes.length === 0) return null;

    const filteredQuotes = quotes.filter(
      (q) => !q.private || q.user === userId,
    );
    const pool = filteredQuotes.length === 0 ? quotes : filteredQuotes;
    const quote = randomArray(pool)[0] as any;

    if (!quote.private || quote.user === userId) {
      await this.quoteModel.updateOne(
        { _id: quote._id },
        { $inc: { [`hits.${userId}`]: 1 } },
      );
    }

    quote.isOnly = filteredQuotes.length <= 1 && quotes.length <= 1;
    return quote;
  }

  async getUserQuotes(userId: string, guildId: string) {
    return this.quoteModel.find({ user: userId, guild: guildId }).lean();
  }

  async listQuotes(
    guildId: string,
    sort: QuoteSort = 'key',
    order: 1 | -1 = 1,
  ) {
    return this.quoteModel.aggregate([
      { $match: { guild: guildId } },
      {
        $addFields: {
          sumHits: {
            $sum: {
              $map: { input: { $objectToArray: '$hits' }, in: '$$this.v' },
            },
          },
        },
      },
      { $sort: { [SORT_FIELD_MAP[sort]]: order } },
    ]);
  }

  async edit(
    userId: string,
    guildId: string,
    quoteId: string,
    content: string,
  ): Promise<string> {
    const quote = await this.quoteModel.findOneAndUpdate(
      { _id: quoteId, user: userId, guild: guildId },
      { 'quote.value': content },
    );
    return quote
      ? '✅ Quote updated.'
      : "❌ Quote not found or it's not your quote.";
  }

  async publish(
    userId: string,
    guildId: string,
    quoteId: string,
  ): Promise<string> {
    const quote = await this.quoteModel.findOneAndUpdate(
      { _id: quoteId, user: userId, guild: guildId },
      { private: false },
    );
    return quote
      ? '✅ Quote published.'
      : "❌ Quote not found or it's not your quote.";
  }

  async setPrivate(
    userId: string,
    guildId: string,
    quoteId: string,
  ): Promise<string> {
    const quote = await this.quoteModel.findOneAndUpdate(
      { _id: quoteId, user: userId, guild: guildId },
      { private: true },
    );
    return quote
      ? '✅ Quote privated.'
      : "❌ Quote not found or it's not your quote.";
  }

  async delete(
    userId: string,
    guildId: string,
    quoteId: string,
  ): Promise<string> {
    const quote = await this.quoteModel.findOneAndDelete({
      _id: quoteId,
      user: userId,
      guild: guildId,
    });
    return quote
      ? '✅ Quote deleted.'
      : "❌ Quote not found or it's not your quote.";
  }
}
