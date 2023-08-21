export default class KakuyomuConstants {
  public static readonly BASE_URL = 'https://kakuyomu.jp';
  public static readonly NOVEL_URL = (novelId: string) => `${KakuyomuConstants.BASE_URL}/works/${novelId}`;
  public static readonly NOVEL_EPISODE_URL = (novelId: string, episodeId: string) =>
    `${KakuyomuConstants.NOVEL_URL(novelId)}/episodes/${episodeId}`;
  public static readonly GENRE_URL = (genre: string) => `${KakuyomuConstants.BASE_URL}/genres/${genre}/recent_works`;
  public static readonly TAG_URL = (tag: string) => `${KakuyomuConstants.BASE_URL}/tags/${tag}/recent_works`;
  public static readonly USER_URL = (userNameTag: string) => `${KakuyomuConstants.BASE_URL}/users/${userNameTag}`;

  public static readonly KAKUYOMU_LOGO_URL = 'https://cdn-static.kakuyomu.jp/images/brand/favicons/app-256.png';
}
