export interface IGenshin {
  userId: string;
  accountId?: string;
  cookieToken?: string;
  cookieString?: string;
  expiresAt?: Date;
  selectedAccount?: IGenshinAccount;
}

export class IGenshinResponse {
  retcode: number;
  message: string;
  data: IGenshinResponseUser | null;
}

export class IGenshinResponseUser {
  list: Array<IGenshinAccount> | null;
}

export class IGenshinAccount {
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
