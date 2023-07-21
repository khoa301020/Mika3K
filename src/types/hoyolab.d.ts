export interface IHoYoLAB {
  userId: string;
  accountId?: string;
  cookieToken?: string;
  cookieString?: string;
  expiresAt?: Date;
  genshinAccount?: IHoYoLABAccount;
  hsrAccount?: IHoYoLABAccount;
  hi3Account?: IHoYoLABAccount;
}

export class IHoYoLABResponse {
  retcode: number;
  message: string;
  data: IHoYoLABResponseUser | null;
}

export class IHoYoLABResponseUser {
  list: Array<IHoYoLABAccount> | null;
}

export class IHoYoLABAccount {
  game?: THoyoGame;
  game_biz: string;
  region: string;
  game_uid: string;
  nickname: string;
  level: number;
  is_chosen: boolean;
  region_name: string;
  is_official: boolean;
}

export interface ICookie {
  cookie_token: string;
  account_id: string;
}

export type THoyoGame = 'genshin' | 'hsr' | 'hi3';
