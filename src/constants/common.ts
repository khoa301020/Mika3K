import { TPaginationType } from '../types/common';

export default class CommonConstants {
  public static readonly USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';
  public static readonly DEFAULT_EMBED_COLOR = 0x0099ff;

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
    `https://free.currconv.com/api/v7/convert?q=${query}&compact=ultra&apiKey=${process.env.CURRENCY_CONVERTER_API_KEY}`;
  public static readonly CURRENCY_LIST_API = `https://free.currconv.com/api/v7/currencies?apiKey=${process.env.CURRENCY_CONVERTER_API_KEY}`;
}
