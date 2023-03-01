export class Constants {
  public static readonly USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';

  public static readonly REGEX_GET_ID = /\[(\d+)\]/;
  public static readonly COLOR_BY_APPROVED = (isApproved: Boolean) => (isApproved ? 0x00ff00 : 0x484a48);
  public static readonly CHART_WIDTH = 800;
  public static readonly CHART_HEIGHT = 400;
  public static readonly QUOTES_PER_PAGE = 10;
  public static readonly GENDER_MAP = {
    male: 'Male ♂',
    female: 'Female ♀',
  };

  /* NHentai constants */
  public static readonly NHENTAI_API = 'https://janda.mod.land/nhentai';
  public static readonly NHENTAI_LOGO = 'https://archive.org/download/nhentai-logo-3/nhentai-logo-3.jpg';

  /* MAL API constants */

  public static readonly MAL_API = 'https://api.myanimelist.net/v2';
  public static readonly MAL_AUTH_API = 'https://myanimelist.net/v1/oauth2';

  /* Jikan API constants */
  private static readonly JIKAN_API = 'https://api.jikan.moe';
  private static readonly JIKAN_VERSION = 'v4';
  public static readonly MAL_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png';

  public static readonly JIKAN_GENRES_FILTER = ['genres', 'explicit_genres', 'themes', 'demographics'];
  public static readonly JIKAN_GENRES_ANIME = `${this.JIKAN_API}/${this.JIKAN_VERSION}/genres/anime`;
  public static readonly JIKAN_GENRES_MANGA = `${this.JIKAN_API}/${this.JIKAN_VERSION}/genres/manga`;
  public static readonly GENRES_PER_PAGE = 10;
  public static readonly EPISODES_PER_PAGE = 10;

  public static readonly JIKAN_ANIME_SEARCH = `${this.JIKAN_API}/${this.JIKAN_VERSION}/anime`;
  public static readonly ANIME = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/anime/${id}`;
  public static readonly ANIME_FULL = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/anime/${id}/full`;
  public static readonly ANIME_CHARACTERS = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/anime/${id}/characters`;
  public static readonly ANIME_STAFF = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/anime/${id}/staff`;
  public static readonly ANIME_EPISODES = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/anime/${id}/episodes`;
  public static readonly ANIME_THEMES = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/anime/${id}/themes`;
  public static readonly ANIME_PICTURES = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/anime/${id}/pictures`;
  public static readonly ANIME_STATISTICS = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/anime/${id}/statistics`;
  public static readonly ANIME_RECOMMENDATIONS = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/anime/${id}/recommendations`;
  public static readonly ANIME_REVIEWS = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/anime/${id}/reviews`;

  public static readonly JIKAN_MANGA_SEARCH = `${this.JIKAN_API}/${this.JIKAN_VERSION}/manga`;
  public static readonly MANGA = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/manga/${id}`;
  public static readonly MANGA_FULL = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/manga/${id}/full`;
  public static readonly MANGA_CHARACTERS = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/manga/${id}/characters`;
  public static readonly MANGA_PICTURES = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/manga/${id}/pictures`;
  public static readonly MANGA_STATISTICS = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/manga/${id}/statistics`;
  public static readonly MANGA_RECOMMENDATIONS = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/manga/${id}/recommendations`;
  public static readonly MANGA_REVIEWS = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/manga/${id}/reviews`;

  public static readonly JIKAN_CHARACTER_SEARCH = `${this.JIKAN_API}/${this.JIKAN_VERSION}/characters`;
  public static readonly CHARACTER = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/characters/${id}`;
  public static readonly CHARACTER_FULL = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/characters/${id}/full`;
  public static readonly CHARACTER_ANIME = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/characters/${id}/anime`;
  public static readonly CHARACTER_MANGA = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/characters/${id}/manga`;
  public static readonly CHARACTER_VOICES = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/characters/${id}/voices`;
  public static readonly CHARACTER_PICTURES = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/characters/${id}/pictures`;

  public static readonly JIKAN_PEOPLE_SEARCH = `${this.JIKAN_API}/${this.JIKAN_VERSION}/people`;
  public static readonly PEOPLE = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/people/${id}`;
  public static readonly PEOPLE_FULL = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/people/${id}/full`;
  public static readonly PEOPLE_ANIME = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/people/${id}/anime`;
  public static readonly PEOPLE_MANGA = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/people/${id}/manga`;
  public static readonly PEOPLE_VOICES = (id: string) => `${this.JIKAN_API}/${this.JIKAN_VERSION}/people/${id}/voices`;
  public static readonly PEOPLE_PICTURES = (id: string) =>
    `${this.JIKAN_API}/${this.JIKAN_VERSION}/people/${id}/pictures`;

  /* Anime search constants */
  public static readonly ANIME_QUERY_TYPE = ['tv', 'movie', 'ova', 'special', 'ona', 'music'];
  public static readonly ANIME_QUERY_STATUS = ['airing', 'complete', 'upcoming'];
  public static readonly ANIME_QUERY_RATING = ['g', 'pg', 'pg13', 'r17', 'r', 'rx'];
  public static readonly ANIME_QUERY_ORDER_BY = [
    'mal_id',
    'title',
    'type',
    'rating',
    'start_date',
    'end_date',
    'episodes',
    'score',
    'scored_by',
    'rank',
    'popularity',
    'members',
    'favorites',
  ];
  public static readonly ANIME_TOP_QUERY_FILTER = ['airing', 'upcoming', 'bypopularity', 'favorite'];

  /* Manga search constants */
  public static readonly MANGA_QUERY_TYPE = ['manga', 'novel', 'lightnovel', 'oneshot', 'doujin', 'manhwa', 'manhua'];
  public static readonly MANGA_QUERY_STATUS = ['publishing', 'complete', 'hiatus', 'discontinued', 'upcoming'];
  public static readonly MANGA_QUERY_ORDER_BY = [
    'mal_id',
    'title',
    'start_date',
    'end_date',
    'chapters',
    'volumes',
    'score',
    'scored_by',
    'rank',
    'popularity',
    'members',
    'favorites',
  ];
  public static readonly MANGA_TOP_QUERY_FILTER = ['publishing', 'upcoming', 'bypopularity', 'favorite'];

  /* Character search constants */
  public static readonly CHARACTER_QUERY_ORDER_BY = ['mal_id', 'name', 'favorites'];

  /* People search constants */
  public static readonly PEOPLE_QUERY_ORDER_BY = ['mal_id', 'name', 'birthday', 'favorites'];

  /* Common constants */
  public static readonly SORT = ['desc', 'asc'];
}
