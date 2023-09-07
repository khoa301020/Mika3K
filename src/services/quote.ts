import { GuildMember } from 'discord.js';
import { SortValues } from 'mongoose';
import CommonConstants from '../constants/common.js';
import Quote from '../models/Quote.js';
import type { IUserQuote, QuoteSort } from '../types/quote.js';

export async function createQuote(userQuote: IUserQuote): Promise<any> {
  return await Quote.create(userQuote);
}

export async function getQuote(keyword: string, guildId: string, userId: string): Promise<Required<IUserQuote> | null> {
  return await Quote.getRandomQuote(keyword, guildId, userId);
}

export async function getUserQuotes(user: GuildMember): Promise<Array<IUserQuote>> {
  const userId = user.user.id;
  const guildId = user.guild.id;

  return await Quote.find({ user: userId, guild: guildId });
}

export async function getListQuotes(
  guildId: string,
  sort: QuoteSort = 'key',
  order: Extract<SortValues, 1 | -1> = 1,
): Promise<Array<IUserQuote> | undefined> {
  return await Quote.aggregate([
    { $match: { guild: guildId } },
    {
      $addFields: {
        sumHits: {
          $sum: {
            $map: {
              input: { $objectToArray: '$hits' },
              in: '$$this.v',
            },
          },
        },
      },
    },
    { $sort: { [CommonConstants.QUOTE_LIST_SORT_BY[sort]]: order } },
  ]);
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
