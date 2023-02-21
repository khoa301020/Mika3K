import { GuildMember } from 'discord.js';
import mongoose from 'mongoose';
import Quote from '../models/Quote.js';
import type { IUserQuote } from '../types/quote.js';

export async function createQuote(userQuote: IUserQuote): Promise<any> {
  return await Quote.create(userQuote);
}

export async function getQuote(keyword: string, guildId: string): Promise<Array<IUserQuote>> {
  const query = mongoose.Types.ObjectId.isValid(keyword) ? { _id: keyword } : { 'quote.key': keyword };
  return await Quote.find({ ...query, guild: guildId }).lean();
}

export async function getUserQuotes(user: GuildMember): Promise<Array<IUserQuote>> {
  const userId = user.user.id;
  const guildId = user.guild.id;

  return await Quote.find({ user: userId, guild: guildId });
}

export async function getListQuotes(guildId: string): Promise<Array<IUserQuote>> {
  return await Quote.find({ guild: guildId }).sort({ 'quote.key': 1 }).lean();
}

export async function editQuote(user: GuildMember, quoteId: string, content: string): Promise<string> {
  const userId = user.user.id;
  const guildId = user.guild.id;

  const quote = await Quote.findOneAndUpdate(
    { _id: quoteId, user: userId, guild: guildId },
    { 'quote.value': content },
  );

  if (!quote) return "❌ Quote not found or it's not your quote.";

  return '✅ Quote updated.';
}

export async function publishQuote(user: GuildMember, quoteId: string): Promise<string> {
  const userId = user.user.id;
  const guildId = user.guild.id;

  const quote = await Quote.findOneAndUpdate({ _id: quoteId, user: userId, guild: guildId }, { private: false });

  if (!quote) return "❌ Quote not found or it's not your quote.";

  return '✅ Quote published.';
}

export async function privateQuote(user: GuildMember, quoteId: string): Promise<string> {
  const userId = user.user.id;
  const guildId = user.guild.id;

  const quote = await Quote.findOneAndUpdate({ _id: quoteId, user: userId, guild: guildId }, { private: true });

  if (!quote) return "❌ Quote not found or it's not your quote.";

  return '✅ Quote privated.';
}

export async function deleteQuote(user: GuildMember, quoteId: string): Promise<string> {
  const userId = user.user.id;
  const guildId = user.guild.id;

  const quote = await Quote.findOneAndDelete({ _id: quoteId, user: userId, guild: guildId });

  if (!quote) return "❌ Quote not found or it's not your quote.";

  return '✅ Quote deleted.';
}
