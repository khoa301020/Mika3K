import { I18n } from '../types/common';
import {
  ICommandSingleSelect,
  ISyosetuGeneralFields,
  ISyosetuNovelPointsFields,
  ISyosetuNovelStatusFields,
  ISyosetuNovelTagsFields,
  TSyosetuBigGenre,
  TSyosetuGenre,
} from '../types/syosetu';

export class SyosetuConstants {
  public static readonly SYOSETU_BASE_URL = 'https://api.syosetu.com/novelapi/api/';
  public static readonly NCODE_NOVEL_BASE_URL = 'https://ncode.syosetu.com/';
  public static readonly SYOSETU_LOGO =
    'https://static.syosetu.com/view/images/common/socialbutton/twitter/twittericon_syosetu.png';
  public static readonly SYOSETU_USER_PAGE = 'https://mypage.syosetu.com/';

  public static readonly BIG_GENRES: { [key in TSyosetuBigGenre]: I18n } = {
    1: { jp: '恋愛', en: 'Love' },
    2: { jp: 'ファンタジー', en: 'Fantasy' },
    3: { jp: '文芸', en: 'Literature' },
    4: { jp: 'SF', en: 'Science fiction' },
    98: { jp: 'ノンジャンル', en: 'Non genre' },
    99: { jp: 'その他', en: 'Other' },
  };

  public static readonly GENRES: { [key in TSyosetuGenre]: I18n } = {
    101: { jp: '異世界〔恋愛〕', en: 'Isekai (Love)' },
    102: { jp: '現実世界〔恋愛〕', en: 'Real world (Love)' },
    201: { jp: 'ハイファンタジー〔ファンタジー〕', en: 'High fantasy (Fantasy)' },
    202: { jp: 'ローファンタジー〔ファンタジー〕', en: 'Low fantasy (Fantasy)' },
    301: { jp: '純文学〔文芸〕', en: 'Pure literature (Literature)' },
    302: { jp: 'ヒューマンドラマ〔文芸〕', en: 'Human drama (Literature)' },
    303: { jp: '歴史〔文芸〕', en: 'History (Literature)' },
    304: { jp: '推理〔文芸〕', en: 'Mystery/Detective (Literature)' },
    305: { jp: 'ホラー〔文芸〕', en: 'Horror (Literature)' },
    306: { jp: 'アクション〔文芸〕', en: 'Action (Literature)' },
    307: { jp: 'コメディー〔文芸〕', en: 'Comedy (Literature)' },
    401: { jp: 'VRゲーム〔SF〕', en: 'VR game (Science fiction)' },
    402: { jp: '宇宙〔SF〕', en: 'Space (Science fiction)' },
    403: { jp: '空想科学〔SF〕', en: 'Imaginary science (Science fiction)' },
    404: { jp: 'パニック〔SF〕', en: 'Disaster (Science fiction )' },
    9901: { jp: '童話〔その他〕', en: 'Fairytale (Other)' },
    9902: { jp: '詩〔その他〕', en: 'Poetry (Other)' },
    9903: { jp: 'エッセイ〔その他〕', en: 'Essay (Other)' },
    9904: { jp: 'リプレイ〔その他〕', en: 'Replay (Other)' },
    9999: { jp: 'その他〔その他〕', en: 'Other (Other)' },
    9801: { jp: 'ノンジャンル〔ノンジャンル〕', en: 'Non genre (Non genre)' },
  };

  public static readonly ORDER: Array<ICommandSingleSelect> = [
    { key: 'new', value: '新着更新順', trans: 'Order by new update' },
    { key: 'favnovelcnt', value: 'ブックマーク数の多い順', trans: 'Order by bookmark' },
    { key: 'reviewcnt', value: 'レビュー数の多い順', trans: 'Order by review' },
    { key: 'hyoka', value: '総合ポイントの高い順', trans: 'Order by total points (desc)' },
    { key: 'hyokaasc', value: '総合ポイントの低い順', trans: 'Order by total points (asc)' },
    { key: 'dailypoint', value: '日間ポイントの高い順', trans: 'Order by daily points' },
    { key: 'weeklypoint', value: '週間ポイントの高い順', trans: 'Order by weekly points' },
    { key: 'monthlypoint', value: '月間ポイントの高い順', trans: 'Order by monthly points' },
    { key: 'quarterpoint', value: '四半期ポイントの高い順', trans: 'Order by quarterly points' },
    { key: 'yearlypoint', value: '年間ポイントの高い順', trans: 'Order by yearly points' },
    { key: 'impressioncnt', value: '感想の多い順', trans: 'Order by impression count' },
    { key: 'hyokacnt', value: '評価者数の多い順', trans: 'Order by rating (desc)' },
    { key: 'hyokacntasc', value: '評価者数の少ない順', trans: 'Order by rating (asc)' },
    { key: 'weekly', value: '週間ユニークユーザの多い順', trans: 'Order by weekly unique users' },
    { key: 'lengthdesc', value: '小説本文の文字数が多い順', trans: 'Order by length (desc)' },
    { key: 'lengthasc', value: '小説本文の文字数が少ない順', trans: 'Order by length (asc)' },
    { key: 'ncodedesc', value: '新着投稿順', trans: 'Order by new create' },
    { key: 'old', value: '更新が古い順', trans: 'Order by old update' },
  ];

  public static readonly TYPES: Array<ICommandSingleSelect> = [
    { key: 't', value: '短編', trans: 'Short story' },
    { key: 'r', value: '連載中', trans: 'Serializing' },
    { key: 'er', value: '完結済連載小説', trans: 'Serialized novel completed' },
    {
      key: 're',
      value: 'すべての連載小説(連載中および完結済)',
      trans: 'All serialized novels (serializing and serialized)',
    },
    { key: 'ter', value: '短編と完結済連載小説', trans: 'Short stories and serialized novels completed' },
  ];

  public static readonly UPDATE_TIME: Array<ICommandSingleSelect> = [
    { key: 'thisweek', value: '今週(日曜日の午前0時はじまり)', trans: 'This week (starts at 0:00 am on Sunday)' },
    {
      key: 'sevenday',
      value: '過去7日間(7日前の午前0時はじまり)',
      trans: 'Past 7 days (starts at 0:00 am 7 days ago)',
    },
    { key: 'lastweek', value: '先週', trans: 'Last week' },
    { key: 'thismonth', value: '今月', trans: 'This month' },
    { key: 'lastmonth', value: '先月', trans: 'Last month' },
  ];

  public static readonly FIELDS: {
    [key in keyof ISyosetuGeneralFields]: I18n;
  } = {
    title: { jp: '小説名', en: 'Novel name' },
    ncode: { jp: 'Nコード', en: 'NCode' },
    userid: { jp: '作者のユーザID', en: "Author's user ID" },
    writer: { jp: '作者名', en: 'Author name' },
    story: { jp: '小説のあらすじ', en: 'Novel synopsis' },
    biggenre: { jp: '大ジャンル', en: 'Big genre' },
    genre: { jp: 'ジャンル', en: ' Genre' },
    keyword: { jp: 'キーワード', en: 'Keyword' },
    general_firstup: { jp: '初回掲載日', en: 'First publication date' },
    general_lastup: { jp: '最終掲載日', en: 'Last publication date' },
    general_all_no: { jp: '全掲載部分数', en: 'Total publications' },
    length: { jp: '小説文字数', en: 'Novel length (in characters)' },
    time: { jp: '読了時間(分単位)', en: 'Reading time (in minutes)' },
    sasie_cnt: { jp: '挿絵の数', en: 'Number of illustrations' },
    kaiwaritu: { jp: '会話率', en: 'Conversation rate' },
    novelupdated_at: { jp: '小説の更新日時', en: 'Last novel update datetime' },
    updated_at: { jp: '最終更新日時（システム用）', en: 'Last data update datetime' },
  };

  public static readonly NOVEL_TAGS: {
    [key in keyof ISyosetuNovelTagsFields]: I18n;
  } = {
    isr15: { jp: 'R15', en: 'R15' },
    isbl: { jp: 'ボーイズラブ', en: 'Yaoi' },
    isgl: { jp: 'ガールズラブ', en: 'Yuri' },
    iszankoku: { jp: '残酷な描写あり', en: 'Cruel' },
    istensei: { jp: '異世界転生', en: 'Tensei' },
    istenni: { jp: '異世界転移', en: 'Tenni' },
  };

  public static readonly NOVEL_STATUS: {
    [key in keyof ISyosetuNovelStatusFields]: { [key: number]: I18n };
  } = {
    end: {
      0: { jp: '完結済み', en: 'Completed' },
      1: { jp: '連載中', en: 'Ongoing' },
    },
    isstop: {
      0: { jp: '長期連載中', en: 'Long-term serializing' },
      1: { jp: '長期連載停止中', en: 'Long-term serialization suspension' },
    },
  };

  public static readonly NOVEL_POINTS: {
    [key in keyof ISyosetuNovelPointsFields]: I18n;
  } = {
    global_point: { jp: '総合評価ポイント', en: 'Overall evaluation points' },
    daily_point: { jp: '日間ポイント', en: 'Daily points' },
    weekly_point: { jp: '週間ポイント', en: 'Weekly points' },
    monthly_point: { jp: '月間ポイント', en: 'Monthly points' },
    quarter_point: { jp: '四半期ポイント', en: 'Quarterly points' },
    yearly_point: { jp: '年間ポイント', en: 'Annual points' },
    fav_novel_cnt: { jp: 'ブックマーク数', en: 'Number of bookmarks' },
    impression_cnt: { jp: '感想数', en: 'Number of impressions' },
    review_cnt: { jp: 'レビュー数', en: 'Number of reviews' },
    all_point: { jp: '評価ポイント', en: 'Evaluation points' },
    all_hyoka_cnt: { jp: '評価者数', en: 'Number of evaluators' },
  };

  public static readonly NOVEL_TYPE: { [key in 1 | 2]: I18n } = {
    1: { jp: '連載', en: 'Serializing' },
    2: { jp: '短編', en: 'Short story' },
  };

  public static readonly NOVEL_UPLOAD_PLATFORM: { [key in 1 | 2 | 3]: I18n } = {
    1: { jp: 'ケータイのみ', en: 'Mobile only' },
    2: { jp: 'PCのみ', en: 'PC only' },
    3: { jp: 'PCとケータイ', en: 'PC and mobile' },
  };
}
