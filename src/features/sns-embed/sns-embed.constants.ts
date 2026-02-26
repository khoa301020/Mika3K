export class SnsEmbedConstants {
  public static readonly TWITTER_URL_REGEX =
    /(?:twitter\.com|x\.com)\/([^/]+)(?:\/status\/(\d+))?/;
  public static readonly FXTWITTER_API = (user: string, tweetId?: string) =>
    `https://api.fxtwitter.com/${user}${tweetId ? `/status/${tweetId}` : ''}`;
  public static readonly TWITTER_LOGO =
    'https://abs.twimg.com/responsive-web/client-web/icon-ios.77d25eba.png';

  public static readonly TIKTOK_URL_REGEX =
    /(https:\/\/|^)((\w|\d)+\.)?tiktok\.com\/.+?\/(video|photo)\/\d+/g;
  public static readonly TIKTOK_ID_REGEX =
    /tiktok\.com\/@[^/]*\/(?:video|photo)\/(\d+)(?=[/?#]|$)/;
  public static readonly TIKTOK_SHORT_URL_REGEX =
    /(https:\/\/|^)((\w|\d)+\.)?tiktok\.com\/[\w\d-]+\/?$/g;
  public static readonly FXTIKTOK_API = (id?: string) =>
    `https://www.fxtiktok.com/api/v1/tiktok/${id ? `post/${id}` : ''}`;
  public static readonly TIKTOK_LOGO =
    'https://img.freepik.com/premium-vector/tik-tok-logo_578229-290.jpg';

  public static readonly BOT_USER_AGENT =
    'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)';

  public static readonly EMBED_TITLE_LIMIT = 256;
  public static readonly EMBED_DESCRIPTION_LIMIT = 4096;
  public static readonly EMBED_FIELD_NAME_LIMIT = 256;
  public static readonly EMBED_FIELD_VALUE_LIMIT = 1024;
  public static readonly EMBED_AUTHOR_NAME_LIMIT = 256;
  public static readonly EMBED_IMAGE_LIMIT = 4;

  // Discord upload limits by premium tier (in bytes)
  public static readonly DISCORD_UPLOAD_LIMITS: Record<number, number> = {
    0: 25 * 1024 * 1024, // 25MB
    1: 25 * 1024 * 1024, // 25MB
    2: 50 * 1024 * 1024, // 50MB
    3: 100 * 1024 * 1024, // 100MB
  };
}
