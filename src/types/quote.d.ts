import { APIEmbed } from 'discord.js';
import { Types } from 'mongoose';
export interface IQuote {
  key: string;
  value?: string;
  embeds?: APIEmbed[];
}

export interface IUserQuote {
  _id?: Types.ObjectId;
  guild: string;
  user: string;
  quote: IQuote;
  hits?: { [key: string]: number };
  private?: Boolean;
  createdAt: Date;
}

export interface IQuoteList {
  _id: Types.ObjectId;
  keyword: string;
  user: string;
  createdAt: string;
}
