export class PixivConstants {
  public static readonly PIXIV_URL = 'https://www.pixiv.net';
  public static readonly PIXIV_IMG_DOMAIN = 'i.pximg.net';
  public static readonly PIXIV_ILLUST_URL = 'https://www.pixiv.net/artworks/';
  public static readonly PIXIV_USER_URL = 'https://www.pixiv.net/users/';
  public static readonly PIXIV_LOGO =
    'https://policies.pixiv.net/favicon.a8396493.ico';
  public static readonly PIXIV_EMBED_COLOR = 0x009cff;

  public static readonly HIBIAPI_URL = 'https://hibiapi.hayasaka.moe';
  public static readonly HIBIAPI_ILLUST_API = (illustId: number | string) =>
    `${PixivConstants.HIBIAPI_URL}/api/pixiv/illust?id=${illustId}`;

  public static readonly JACKLI_IMG_DOMAIN = 'pximg.jackli.dev';

  public static readonly PIXIV_SAFE_VALUE = 0;
  public static readonly PIXIV_ILLUST_URL_REGEX: RegExp =
    /(?:https:\/\/)?(?:www\.)?pixiv\.net\/(?:\w+\/)?artworks\/(\d+)/i;

  public static readonly EMBED_AUTHOR_NAME_LIMIT = 256;
  public static readonly EMBED_TITLE_LIMIT = 256;
  public static readonly EMBED_DESCRIPTION_LIMIT = 4096;
}
