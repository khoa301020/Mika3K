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
  poll?: IFxPoll;
  icon: string;
}

export interface IFxAuthor {
  name: string;
  url: string;
  icon_url?: string;
}

export interface IFxPoll {
  question: string;
  choices: IFxPollChoice[];
  duration: number;
}

export interface IFxPollChoice {
  label: string;
  votes: number;
  percentage: number;
}

export type TEmbedType = 'tweet' | 'user';