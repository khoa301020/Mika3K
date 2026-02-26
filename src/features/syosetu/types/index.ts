export type I18n = { jp: string; en: string };

export interface ISyosetuRequest {
  gzip?: TGzip;
  out?: TOut;
  of?: Array<TOf>;
  lim?: number;
  st?: number;
  order?: TOrder;
  word?: string;
  notword?: string;
  title?: 1;
  ex?: 1;
  keyword?: 1;
  wname?: 1;
  biggenre?: Array<TSyosetuBigGenre>;
  notbiggenre?: Array<TSyosetuBigGenre>;
  genre?: Array<TSyosetuGenre>;
  notgenre?: Array<TSyosetuGenre>;
  userid?: Array<number | string>;
  isr15?: 1;
  isbl?: 1;
  isgl?: 1;
  iszankoku?: 1;
  istensei?: 1;
  istenni?: 1;
  notr15?: 1;
  notbl?: 1;
  notgl?: 1;
  notzankoku?: 1;
  nottensei?: 1;
  nottenni?: 1;
  minlen?: number;
  maxlen?: number;
  length?: number | string;
  kaiwaritu?: number | string;
  sasie?: number | string;
  minTime?: number;
  maxTime?: number;
  time?: number | string;
  ncode?: Array<string>;
  type?: TType;
  buntai?: Array<TBuntai>;
  stop?: TStop;
  lastup?: TLastUp | Date;
  lastupdate?: TLastUp | Date;
  ispickup?: 1;
}

export interface ISyosetuResponseMeta {
  allcount: number;
}

export interface ISyosetuNovel {
  title: string;
  ncode: string;
  userid: number;
  writer: string;
  story: string;
  biggenre: TSyosetuBigGenre;
  genre: TSyosetuGenre;
  gensaku?: string;
  keyword: string;
  general_firstup: string;
  general_lastup: string;
  novel_type: 1 | 2;
  end: 0 | 1;
  general_all_no: number;
  length: number;
  time: number;
  isstop: 0 | 1;
  isr15: 0 | 1;
  isbl: 0 | 1;
  isgl: 0 | 1;
  iszankoku: 0 | 1;
  istensei: 0 | 1;
  istenni: 0 | 1;
  pc_or_k: 1 | 2 | 3;
  global_point: number;
  daily_point: number;
  weekly_point: number;
  monthly_point: number;
  quarter_point: number;
  yearly_point: number;
  fav_novel_cnt: number;
  impression_cnt: number;
  review_cnt: number;
  all_point: number;
  all_hyoka_cnt: number;
  sasie_cnt: number;
  kaiwaritu: number;
  novelupdated_at: string;
  updated_at?: string;
}

export type ISyosetuMetadataFields = Pick<
  ISyosetuNovel,
  | 'ncode'
  | 'title'
  | 'writer'
  | 'story'
  | 'general_firstup'
  | 'general_lastup'
  | 'novel_type'
  | 'end'
  | 'general_all_no'
  | 'length'
  | 'time'
  | 'novelupdated_at'
>;

export type ISyosetuGeneralFields = Pick<
  ISyosetuNovel,
  | 'title'
  | 'ncode'
  | 'userid'
  | 'writer'
  | 'story'
  | 'biggenre'
  | 'genre'
  | 'keyword'
  | 'general_firstup'
  | 'general_lastup'
  | 'general_all_no'
  | 'length'
  | 'time'
  | 'sasie_cnt'
  | 'kaiwaritu'
  | 'novelupdated_at'
  | 'updated_at'
>;

export type ISyosetuGeneralEmbedFields = Omit<
  ISyosetuGeneralFields,
  | 'title'
  | 'ncode'
  | 'userid'
  | 'writer'
  | 'story'
  | 'keyword'
  | 'updated_at'
  | 'biggenre'
  | 'genre'
>;

export type ISyosetuNovelTagsFields = Pick<
  ISyosetuNovel,
  'isr15' | 'isbl' | 'isgl' | 'iszankoku' | 'istensei' | 'istenni'
>;

export type ISyosetuNovelStatusFields = Pick<ISyosetuNovel, 'end' | 'isstop'>;

export type ISyosetuNovelPointsFields = Pick<
  ISyosetuNovel,
  | 'global_point'
  | 'daily_point'
  | 'weekly_point'
  | 'monthly_point'
  | 'quarter_point'
  | 'yearly_point'
  | 'fav_novel_cnt'
  | 'impression_cnt'
  | 'review_cnt'
  | 'all_point'
  | 'all_hyoka_cnt'
>;

export type TGzip = 1 | 2 | 3 | 4 | 5;
export type TOut = 'yaml' | 'json' | 'php' | 'atom' | 'jsonp';
export type TOf =
  | 't'
  | 'n'
  | 'u'
  | 'w'
  | 's'
  | 'bg'
  | 'g'
  | 'k'
  | 'gf'
  | 'gl'
  | 'nt'
  | 'e'
  | 'ga'
  | 'l'
  | 'ti'
  | 'i'
  | 'ir'
  | 'ibl'
  | 'igl'
  | 'izk'
  | 'its'
  | 'iti'
  | 'p'
  | 'gp'
  | 'dp'
  | 'wp'
  | 'mp'
  | 'qp'
  | 'yp'
  | 'f'
  | 'imp'
  | 'r'
  | 'a'
  | 'ah'
  | 'sa'
  | 'ka'
  | 'nu'
  | 'ua';

export type TOrder =
  | 'new'
  | 'favnovelcnt'
  | 'reviewcnt'
  | 'hyoka'
  | 'hyokaasc'
  | 'dailypoint'
  | 'weeklypoint'
  | 'monthlypoint'
  | 'quarterpoint'
  | 'yearlypoint'
  | 'impressioncnt'
  | 'hyokacnt'
  | 'hyokacntasc'
  | 'weekly'
  | 'lengthdesc'
  | 'lengthasc'
  | 'ncodedesc'
  | 'old';

export type TSyosetuBigGenre = 1 | 2 | 3 | 4 | 99 | 98;
export type TSyosetuGenre =
  | 101
  | 102
  | 201
  | 202
  | 301
  | 302
  | 303
  | 304
  | 305
  | 306
  | 307
  | 401
  | 402
  | 403
  | 404
  | 9801
  | 9901
  | 9902
  | 9903
  | 9904
  | 9999;

export type TType = 't' | 'r' | 'er' | 're' | 'ter';
export type TBuntai = 1 | 2 | 4 | 6;
export type TStop = 1 | 2;
export type TLastUp =
  | 'thisweek'
  | 'sevenday'
  | 'lastweek'
  | 'thismonth'
  | 'lastmonth';

export interface ICommandMultiSelect {
  id: number;
  genre: string;
  trans: string;
}

export interface ICommandSingleSelect {
  key: string;
  value: string;
  trans: string;
}

export type TFollowTarget = 'users' | 'channels';
export type TFollowAction = 'follow' | 'unfollow';

export interface IMongooseDocumentNovel {
  ncode: string;
  metadata: ISyosetuMetadataFields;
  followings: {
    users: Array<string>;
    channels: Array<string>;
  };
  lastSystemUpdate: Date;
}
