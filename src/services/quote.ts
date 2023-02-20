import Quote from '../models/Quote.js';
import type { IUserQuote } from '../types/quote.js';

export async function createQuote(userQuote: IUserQuote): Promise<any> {
  return await Quote.create(userQuote);
}

export async function getQuote(keyword: String, guildId: String): Promise<Array<any>> {
  return await Quote.find({ 'quote.key': keyword, guild: guildId }).lean();
}
