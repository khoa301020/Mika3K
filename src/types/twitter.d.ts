import { APIEmbedVideo } from 'discord.js';

export interface IFxTweet {
  url: string;
  title: string;
  themeColor: number;
  author: IFxTwitterAuthor;
  description: string;
  image: string;
  video?: IFxTwitterVideo;
}

export interface IFxTwitterAuthor {
  name: string;
  url: string;
}

export interface IFxTwitterVideo extends APIEmbedVideo {}
