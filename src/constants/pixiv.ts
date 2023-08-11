import { cache } from '../main.js';

export default class PixivConstants {
  public static readonly PIXIV_URL = 'https://www.pixiv.net';
  public static readonly PIXIV_IMG_DOMAIN = 'i.pximg.net';
  public static readonly PIXIV_ILLUST_URL = 'https://www.pixiv.net/artworks/';
  public static readonly PIXIV_LOGO = 'https://policies.pixiv.net/favicon.a8396493.ico';

  /* Pixiv API */
  public static readonly PIXIV_API_URL = 'https://app-api.pixiv.net';
  public static readonly PIXIV_AUTH_URL = 'https://oauth.secure.pixiv.net/auth/token';
  public static readonly PIXIV_ILLUST_API = (illustId: number | string) =>
    `${PixivConstants.PIXIV_API_URL}/v1/illust/detail?illust_id=${illustId}&access_token=${cache.get(
      'pixivAccessToken',
    )}`;

  /* Third party */
  public static readonly HIBIAPI_URL = 'https://hibiapi.hayasaka.moe'; // Use this if access_token expired/invalid
  public static readonly HIBIAPI_ILLUST_API = (illustId: number | string) =>
    `${PixivConstants.HIBIAPI_URL}/api/pixiv/illust?id=${illustId}`;

  public static readonly JACKLI_IMG_DOMAIN = 'pximg.jackli.dev';

  /* Pixiv constants */
  public static readonly PIXIV_SAFE_VALUE = 0;
  public static readonly PIXIV_ILLUST_URL_REGEX: RegExp =
    /(?:https:\/\/)?(?:www\.)?pixiv\.net\/(?:\w+\/)?artworks\/(\d+)/i;
}
