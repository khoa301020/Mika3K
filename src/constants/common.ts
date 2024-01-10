import { TPaginationType } from '../types/common';
import { QuoteSort } from '../types/quote';

export default class CommonConstants {
  public static readonly USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203';
  public static readonly BOT_USER_AGENT = 'Discordbot/2.0 (+https://discordapp.com)';
  public static readonly DEFAULT_EMBED_COLOR = 0x0099ff;
  public static readonly EMBED_TITLE_LIMIT = 256;
  public static readonly EMBED_DESCRIPTION_LIMIT = 4096;
  public static readonly EMBED_FIELD_NAME_LIMIT = 256;
  public static readonly EMBED_FIELD_VALUE_LIMIT = 1024;
  public static readonly EMBED_FIELD_LIMIT = 25;
  public static readonly EMBED_FOOTER_TEXT_LIMIT = 2048;
  public static readonly EMBED_AUTHOR_NAME_LIMIT = 256;
  public static readonly EMBED_TOTAL_LIMIT = 6000;
  public static readonly EMBED_LIMIT_PER_MESSAGE = 10;

  public static readonly REGEX_NUM = /^\d+$/;
  public static readonly REGEX_HTML_TAG = /<[^>]*>?/gm;

  public static readonly CHART_WIDTH = 800;
  public static readonly CHART_HEIGHT = 400;
  public static readonly QUOTES_PER_PAGE = 10;
  public static readonly BOOLEAN_MAP: { [key: string]: string } = {
    true: '✅',
    false: '❌',
  };
  public static readonly GENDER_MAP = {
    male: 'Male ♂',
    female: 'Female ♀',
  };
  public static readonly DAYS_IN_MONTH = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  ];
  public static readonly MONTHS_IN_YEAR = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  public static readonly TIMEZONE_OFFSET = [
    -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, +0, +1, +2, +3, +4, +5, +6, +7, +8, +9, +10, +11, +12,
  ];
  public static readonly PAGINATION_TYPE: { [key: string]: TPaginationType } = {
    BUTTON: 'button',
    MENU: 'menu',
  };
  public static readonly MATHJS_API = 'http://api.mathjs.org/v4/?expr=';
  public static readonly CURRENCY_CONVERTER_API = (query: string) =>
    `http://api.exchangeratesapi.io/v1/latest?access_key=${process.env.CURRENCY_CONVERTER_API_KEY}&${query}`;
  public static readonly CURRENCY_LIST_API = `http://api.exchangeratesapi.io/v1/symbols?access_key=${process.env.CURRENCY_CONVERTER_API_KEY}`;
  public static readonly NOTIFY_TYPE = {
    NHENTAI_AUTOVIEW: 'NHentai Autoview',
    BA_SCHALEDB_UPDATE: 'SchaleDB Update',
  };
  public static readonly QUOTE_LIST_SORT_BY: { [key in QuoteSort]: string } = {
    key: 'quote.key',
    hits: 'sumHits',
  };
  public static readonly TWITTER_URL_REGEX = /https:\/\/(twitter|x)\.com\/.+?\/status\/\d+/g;
}
