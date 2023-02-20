import { GuildMember } from 'discord.js';
import Quote from '../models/Quote.js';
import type { IUserQuote } from '../types/quote.js';

export async function createQuote(userQuote: IUserQuote): Promise<any> {
  return await Quote.create(userQuote);
}

export async function getQuote(keyword: string, guildId: string): Promise<Array<any>> {
  return await Quote.find({ 'quote.key': keyword, guild: guildId }).lean();
}

export async function getListQuote(guildId: string): Promise<Array<any>> {
  return await Quote.find({ guild: guildId }).sort({ 'quote.key': 1 }).lean();
}

export async function editQuote(user: GuildMember, quoteId: string, content: string): Promise<string> {
  const userId = user.user.id;
  const guildId = user.guild.id;

  const quote = await Quote.findOneAndUpdate(
    { _id: quoteId, user: userId, guild: guildId },
    { 'quote.value': content },
  );

  if (!quote) return 'Quote not found or not your quote.';

  return 'Quote updated successfully.';
}
