export interface IHoYoLAB {
  userId: string;
  expiresAt?: Date;
  hoyoUsers: Array<IHoYoLABUser>;
  receiveNotify?: boolean;
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

export interface INoteResponse {
  retcode: number;
  message: string;
  data: INoteHSRData | INoteGenshinData | null;
}

export interface INoteHSRData {
  current_stamina: number;
  max_stamina: number;
  stamina_recover_time: number;
  accepted_epedition_num: number;
  total_expedition_num: number;
  expeditions: Array<TExpeditionHSR>;
  current_train_score: number;
  max_train_score: number;
  current_rogue_score: number;
  max_rogue_score: number;
  weekly_cocoon_cnt: number;
  weekly_cocoon_limit: number;
}

export interface IExpeditionHSR {
  avatars: string[];
  status: string;
  remaining_time: number;
  name: string;
}

export interface INoteGenshinData {
  current_resin: number;
  max_resin: number;
  resin_recovery_time: string;
  finished_task_num: number;
  total_task_num: number;
  is_extra_task_reward_received: boolean;
  remain_resin_discount_num: number;
  resin_discount_num_limit: number;
  current_expedition_num: number;
  max_expedition_num: number;
  expeditions: Array<IExpeditionGenshin>;
  current_home_coin: number;
  max_home_coin: number;
  home_coin_recovery_time: string;
  calendar_url: string;
  transformer: Transformer;
}

export interface IExpeditionGenshin {
  avatar_side_icon: string;
  status: string;
  remained_time: string;
}

export interface Transformer {
  obtained: boolean;
  recovery_time: RecoveryTime;
  wiki: string;
  noticed: boolean;
  latest_job_id: string;
}

export interface RecoveryTime {
  Day: number;
  Hour: number;
  Minute: number;
  Second: number;
  reached: boolean;
}
