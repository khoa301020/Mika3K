import Quote from '../models/Quote.js';
import { IUserQuote } from '../types/quote.js';

export async function createQuote(userQuote: IUserQuote): Promise<IUserQuote> {
  return await Quote.create(userQuote);
}

export async function getQuote(keyword: String, guildId: String): Promise<Array<IUserQuote>> {
  return await Quote.find({ 'quote.key': keyword, guild: guildId }).lean();
}
