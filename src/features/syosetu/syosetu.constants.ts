import {
  I18n,
  ISyosetuNovelTagsFields,
  TOf,
  TSyosetuBigGenre,
  TSyosetuGenre,
} from './types';

export class SyosetuConstants {
  public static readonly SYOSETU_BASE_URL =
    'https://api.syosetu.com/novelapi/api/';
  public static readonly NCODE_NOVEL_BASE_URL = 'https://ncode.syosetu.com/';
  public static readonly SYOSETU_LOGO =
    'https://static.syosetu.com/view/images/common/socialbutton/twitter/twittericon_syosetu.png';
  public static readonly SYOSETU_USER_PAGE = 'https://mypage.syosetu.com/';

  public static readonly SYOSETU_METADATA_QUERY_PARAMS: Array<TOf> = [
    'n',
    't',
    'w',
    's',
    'gf',
    'gl',
    'nt',
    'e',
    'ga',
    'l',
    'ti',
    'nu',
  ];

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
    201: {
      jp: 'ハイファンタジー〔ファンタジー〕',
      en: 'High fantasy (Fantasy)',
    },
    202: {
      jp: 'ローファンタジー〔ファンタジー〕',
      en: 'Low fantasy (Fantasy)',
    },
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
}
