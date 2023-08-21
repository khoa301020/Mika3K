import { ObjectId } from 'mongoose';

export interface IKakuyomuNovel {
  novelId: string;
  title: string;
  isOneshot: boolean;
  authorName: string;
  authorNameTag: string;
  status: string;
  chapters: Array<IKakuyomuNovelChapter>;
  chaptersCount: number;
  type: string;
  genre: IKakuyomuNovelGenre;
  // collection?: string;
  safeRating?: Array<string>;
  tags: Array<IKakuyomuNovelTag>;
  wordsCount: number;
  publishDate: Date | string;
  lastUpdate: Date | string;
  reviewsCount: number;
  commentsCount: number;
  followersCount: number;
  catchPhrase: string;
  catchPhraseAuthor: string;
  introduction: string;
  points: number;
}

export interface IKakuyomuNovelGenre {
  name: string;
  tag: string;
}

export interface IKakuyomuNovelTag {
  name: string;
  tag: string;
}

export interface IKakuyomuNovelChapter {
  title: string;
  episodes: Array<IKakuyomuNovelEpisode>;
}

export interface IKakuyomuNovelEpisode {
  episodeId: string;
  title: string;
  lastUpdate: Date | string;
}

export interface IKakuyomuDocument {
  _id?: ObjectId;
  novelId: string;
  novelData: Omit<IKakuyomuNovel, 'novelId'>;
  followings: {
    users: Array<string>;
    channels: Array<string>;
  };
  lastSystemUpdate: Date;
}
