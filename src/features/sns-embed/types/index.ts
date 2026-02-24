import { EmbedField } from 'discord.js';

export interface IFxEmbed {
  source: string;
  url: string;
  title: string;
  themeColor: number;
  author: IFxAuthor;
  description: string;
  thumbnail?: string;
  images?: string[];
  videos?: string[];
  fields?: EmbedField[];
  icon: string;
}

export interface IFxAuthor {
  name: string;
  url: string;
  icon_url?: string;
}

export type TEmbedType = 'tweet' | 'user';
