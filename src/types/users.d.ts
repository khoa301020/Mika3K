import { ObjectId } from "mongoose";
import { IHoYoLABUser } from "./hoyolab";

export interface IUser {
  id: string;
  hoyoUsers: IHoYoLABUser[];
  MAL: IMALUser;
  receiveNotify: IReceiveNotify;
}

export interface IReceiveNotify {
  [key in TUserNotify]: boolean;
}

export type TUserNotify = 'Syosetu Novel Update' | 'HoYoLAB Daily Login';

export interface IMALUser {
  codeChallenge: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  followingAnimes: string[];
  followingMangas: string[];
  lastCheckIncoming: Date;
}