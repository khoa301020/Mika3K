export interface ISyosetuRequest {
  /* Export parameters */
  gzip?: TGzip;
  out?: TOut;
  of?: Array<TOf>; // Output fields
  lim?: number; // Number of outputs per page, from 1 up to 500 (default 20)
  st?: number; // Start position of output (default 1), max 2000
  order?: TOrder;

  /* Query parameters */

  // Search word specification
  word?: string;
  notword?: string;

  // Scopes of extraction. If omitted, all are extracted. If determined to be an N code, only find by Ncode.
  title?: 1;
  ex?: 1;
  keyword?: 1;
  wname?: 1;

  // Big genres specification
  biggenre?: Array<TSyosetuBigGenre>;

  // Big genre excluding specification
  notbiggenre?: Array<TSyosetuBigGenre>;

  // Genres specification
  genre?: Array<TSyosetuGenre>;

  // Genre excluding specification
  notgenre?: Array<TSyosetuGenre>;

  // User ID specification
  userid?: Array<number | string>;

  // Designation of keywords required for registration
  isr15?: 1; // R15
  isbl?: 1; // Boy's Love
  isgl?: 1; // Girl's Love
  iszankoku?: 1; // Cruel
  istensei?: 1; // Isekai Reincarnation
  istenni?: 1; // Isekai Transfer
  istt?: 1; // Isekai Reincarnation or Transfer

  // Designation of keywords to be excluded from registration
  notr15?: 1; // R15
  notbl?: 1; // Boy's Love
  notgl?: 1; // Girl's Love
  notzankoku?: 1; // Cruel
  nottensei?: 1; // Isekai Reincarnation
  nottenni?: 1; // Isekai Transfer

  // Number of words specification
  minlen?: number;
  maxlen?: number;
  length?: number | string;

  // Conversation rate specification
  kaiwaritu?: number | string; // 0-100

  // Number of illustrations specification
  sasie?: number | string;

  // Reading time specification (number of characters / 500)
  minTime?: number;
  maxTime?: number;
  time?: number | string;

  // Ncode specification
  ncode?: Array<string>;

  // Novel type specification
  type?: TType;

  // Style designation specification
  buntai?: Array<TBuntai>;

  // Serial suspension status specification
  stop?: TStop;

  // Last up (creation) specification
  lastup?: TLastUp | Date;

  // Last update specification
  lastupdate?: TLastUp | Date;

  // Specify whether the novel is picked up
  ispickup?: 1;
}

export interface ISyosetuResponseMeta {
  allcount: number; // 全小説出力数 // Total number of novels output.
}

export interface ISyosetuNovel {
  title: string; // 小説名 // Novel name
  ncode: string; // Nコード // N code
  userid: number; // 作者のユーザID(数値) // Author's user ID (number)
  writer: string; // 作者名 // Author name
  story: string; // 小説のあらすじ // Novel synopsis
  biggenre: TSyosetuBigGenre; // 大ジャンル // Big genre
  genre: TSyosetuGenre; // ジャンル // Genre
  gensaku?: string; // 現在未使用項目(常に空文字列が返ります) // Currently unused item (always returns an empty string)
  keyword: string; // キーワード // Keyword
  general_firstup: Date; // 初回掲載日（YYYY-MM-DD HH:MM:SSの形式） // First publication date (in the form of YYYY-MM-DD HH:MM:SS)
  general_lastup: Date; // 最終掲載日（YYYY-MM-DD HH:MM:SSの形式） // Last publication date (in the form of YYYY-MM-DD HH:MM:SS)
  novel_type: 1 | 2; // 連載の場合は1、短編の場合は2 // 1 for serial, 2 for short story
  end: 0 | 1; // 短編小説と完結済小説は0となっています。連載中は1です。 // Short stories and completed novels are 0. It is 1 if still ongoing.
  general_all_no: number; // 全掲載部分数です。短編の場合は1です。 // Total number of all publications. It is 1 for short stories.
  length: number; // 小説文字数です。スペースや改行は文字数としてカウントしません。 // Novel character count. Spaces and line breaks are not counted as characters.
  time: number; // 読了時間(分単位)です。読了時間は小説文字数÷500を切り上げした数値です。 // Reading time (in minutes). The reading time is the number of novel characters ÷ 500 rounded up.
  isstop: 0 | 1; // 長期連載停止中なら1、それ以外は0です。 // 1 if it is in long-term serialization suspension, 0 otherwise.
  isr15: 0 | 1; // 登録必須キーワードに「R15」が含まれる場合は1、それ以外は0です。 // 1 if the required keyword "R15" is included, 0 otherwise.
  isbl: 0 | 1; // 登録必須キーワードに「ボーイズラブ」が含まれる場合は1、それ以外は0です。 // 1 if the required keyword "Boy's Love" is included, 0 otherwise.
  isgl: 0 | 1; // 登録必須キーワードに「ガールズラブ」が含まれる場合は1、それ以外は0です。 // 1 if the required keyword "Girl's Love" is included, 0 otherwise.
  iszankoku: 0 | 1; // 登録必須キーワードに「残酷な描写あり」が含まれる場合は1、それ以外は0です。 //　1 if the required keyword "Cruel depiction included" is included, 0 otherwise.
  istensei: 0 | 1; // 登録必須キーワードに「異世界転生」が含まれる場合は1、それ以外は0です。 //　1 if the required keyword "Isekai Reincarnation" is included, 0 otherwise.
  istenni: 0 | 1; // 登録必須キーワードに「異世界転移」が含まれる場合は1、それ以外は0です。 //　1 if the required keyword "Isekai Transfer" is included, 0 otherwise.
  pc_or_k: 1 | 2 | 3; // 1はケータイのみ、2はPCのみ、3はPCとケータイで投稿された作品です。 //　1 is mobile only, 2 is PC only, 3 is work posted on PC and mobile.
  global_point: number; // 総合評価ポイント //　Overall evaluation points
  daily_point: number; // 日間ポイント //　Daily points
  weekly_point: number; // 週間ポイント //　Weekly points
  monthly_point: number; // 月間ポイント //　Monthly points
  quarter_point: number; // 四半期ポイント //　Quarterly points
  yearly_point: number; // 年間ポイント //　Annual points
  fav_novel_cnt: number; // ブックマーク数 //　Number of bookmarks
  impression_cnt: number; // 感想数 //　Number of impressions
  review_cnt: number; // レビュー数 //　Number of reviews
  all_point: number; // 評価ポイント //　Evaluation points
  all_hyoka_cnt: number; // 評価者数 //　Number of evaluators
  sasie_cnt: number; // 挿絵の数 //　Number of illustrations
  kaiwaritu: number; // 会話率 //　Conversation rate
  novelupdated_at: Date; // 小説の更新日時 //　Last novel update datetime
  updated_at?: Date; // 最終更新日時 //　Last data update date time (this is for the system and has nothing to do with the novel update)
}

export interface ISyosetuMetadataFields
  extends Pick<
    ISyosetuNovel,
    | 'title'
    | 'writer'
    | 'story'
    | 'general_lastup'
    | 'novel_type'
    | 'end'
    | 'general_all_no'
    | 'length'
    | 'time'
    | 'novelupdated_at'
  > {}

export interface ISyosetuGeneralFields
  extends Pick<
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
  > {}

export interface ISyosetuGeneralEmbedFields
  extends Omit<
    ISyosetuGeneralFields,
    'title' | 'ncode' | 'userid' | 'writer' | 'story' | 'keyword' | 'updated_at' | 'biggenre' | 'genre'
  > {}

export interface ISyosetuNovelTagsFields
  extends Pick<ISyosetuNovel, 'isr15' | 'isbl' | 'isgl' | 'iszankoku' | 'istensei' | 'istenni'> {}

export interface ISyosetuNovelStatusFields extends Pick<ISyosetuNovel, 'end' | 'isstop'> {}

export interface ISyosetuNovelPointsFields
  extends Pick<
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
  > {}

export type TGzip = 1 | 2 | 3 | 4 | 5;

export type TOut = 'yaml' | 'json' | 'php' | 'atom' | 'jsonp';

export type TOf =
  | 't' //title
  | 'n' //ncode
  | 'u' //userid
  | 'w' //writer
  | 's' //story
  | 'bg' //biggenre
  | 'g' //genre
  | 'k' //keyword
  | 'gf' //general_firstup
  | 'gl' //general_lastup
  | 'nt' //noveltype
  | 'e' //end
  | 'ga' //general_all_no
  | 'l' //length
  | 'ti' //time
  | 'i' //isstop
  | 'ir' //isr15
  | 'ibl' //isbl
  | 'igl' //isgl
  | 'izk' //iszankoku
  | 'its' //istensei
  | 'iti' //istenni
  | 'p' //pc_or_k
  | 'gp' //global_point
  | 'dp' //daily_point
  | 'wp' //weekly_point
  | 'mp' //monthly_point
  | 'qp' //quarter_point
  | 'yp' //yearly_point
  | 'f' //fav_novel_cnt
  | 'imp' //impression_cnt
  | 'r' //review_cnt
  | 'a' //all_point
  | 'ah' //all_hyoka_cnt
  | 'sa' //sasie_cnt
  | 'ka' //kaiwaritu
  | 'nu' //novelupdated_at
  | 'ua'; //updated_at

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

export type TSyosetuBigGenre =
  | 1 // 恋愛 // Love
  | 2 // ファンタジー // Fantasy
  | 3 // 文芸 // Literature
  | 4 // SF // Science fiction
  | 99 // その他 // Other
  | 98; // ノンジャンル // Non genre

export type TSyosetuGenre =
  | 101 // 異世界〔恋愛〕// Isekai (Love)
  | 102 // 現実世界〔恋愛〕// Real world (Love)
  | 201 // ハイファンタジー〔ファンタジー〕// High fantasy (Fantasy)
  | 202 // ローファンタジー〔ファンタジー〕// Low fantasy (Fantasy)
  | 301 // 純文学〔文芸〕// Pure literature (Literature)
  | 302 // ヒューマンドラマ〔文芸〕// Human drama (Literature)
  | 303 // 歴史〔文芸〕// History (Literature)
  | 304 // 推理〔文芸〕// Mystery/Detective (Literature)
  | 305 // ホラー〔文芸〕// Horror (Literature)
  | 306 // アクション〔文芸〕// Action (Literature)
  | 307 // コメディー〔文芸〕// Comedy (Literature)
  | 401 // VRゲーム〔SF〕// VR game (Science fiction)
  | 402 // 宇宙〔SF〕// Space (Science fiction)
  | 403 // 空想科学〔SF〕// Imaginary science (Science fiction)
  | 404 // パニック〔SF〕// Disaster (Science fiction)
  | 9801 // ノンジャンル〔ノンジャンル〕// Non genre (Non genre)
  | 9901 // 童話〔その他〕// Fairy tale (Other)
  | 9902 // 詩〔その他〕// Poem (Other)
  | 9903 // エッセイ〔その他〕// Essay (Other)
  | 9904 // リプレイ〔その他〕// Replay (Other)
  | 9999; // その他〔その他〕// Other (Other)

export type TType =
  | 't' // 短編 // Short story
  | 'r' // 連載中 // Serializing
  | 'er' // 完結済連載小説 // Serialized novel completed
  | 're' // すべての連載小説(連載中および完結済) // All serialized novels (serializing and serialized)
  | 'ter'; // 短編と完結済連載小説 // Short stories and serialized novels completed

export type TBuntai =
  | 1 // 字下げされておらず、連続改行が多い作品 // Works with few continuous line breaks and no indentation
  | 2 // 字下げされていないが、改行数は平均な作品 // Works with no indentation but average number of line breaks
  | 4 // 字下げが適切だが、連続改行が多い作品 // Works with appropriate indentation but many continuous line breaks
  | 6; // 字下げが適切でかつ改行数も平均な作品 // Works with appropriate indentation and average number of line breaks

export type TStop =
  | 1 // 長期連載停止中を除きます // Excluding long-term serial suspension
  | 2; // 長期連載停止中のみ取得します // Get only long-term serial suspension

export type TLastUp =
  | 'thisweek' // 今週(日曜日の午前0時はじまり) // This week (starts at 0:00 am on Sunday)
  | 'sevenday' // 過去7日間(7日前の午前0時はじまり) // Past 7 days (starts at 0:00 am 7 days ago)
  | 'lastweek' // 先週 // Last week
  | 'thismonth' // 今月 // This month
  | 'lastmonth'; // 先月 // Last month

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
