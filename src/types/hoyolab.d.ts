export interface IHoYoLAB {
  userId: string;
  expiresAt?: Date;
  hoyoUsers: Array<IHoYoLABUser>;
}

export interface IHoYoLABUser {
  remark: string;
  cookieString: string;
  gameAccounts: Array<IHoYoLABGameAccount>;
}

export class IHoYoLABGameAccount {
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

export type THoyoGame = 'genshin' | 'hsr' | 'hi3';
export class IHoYoLABResponse {
  retcode: number;
  message: string;
  data: IHoYoLABResponseUser | null;
}

export class IHoYoLABResponseUser {
  list: Array<IHoYoLABGameAccount> | null;
}

export class IRedeemResult {
  remark: string;
  accounts: Array<IRedeemResultAccount>;
}

export class IRedeemResultAccount {
  nickname: string;
  code?: number;
  message: string;
  game?: THoyoGame;
  uid?: string;
}
