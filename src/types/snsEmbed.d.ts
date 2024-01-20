import { APIEmbedVideo } from 'discord.js';

export interface IFxEmbed {
  source: string;
  url: string;
  title: string;
  themeColor: number;
  author: IFxAuthor;
  description: string;
  image: string;
  video?: IFxVideo;
  icon: string;
}

export interface IFxAuthor {
  name: string;
  url: string;
}

export interface IFxVideo extends APIEmbedVideo {
  url: string;
}
