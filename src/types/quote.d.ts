import { Types } from 'mongoose';
export interface IQuote {
  key: string;
  value: string;
}

export interface IUserQuote {
  _id?: Types.ObjectId;
  guild: string;
  user: string;
  quote: IQuote;
  private?: Boolean;
  createdAt: Date;
}

export interface IQuoteList {
  _id: Types.ObjectId;
  keyword: string;
  user: string;
  createdAt: string;
}
