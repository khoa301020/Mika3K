const JIKAN_API = 'https://api.jikan.moe';
const JIKAN_VERSION = 'v4';

export const REGEX_GET_ID = /\[(\d+)\]/;
export const COLOR_BY_APPROVED = (isApproved: boolean) =>
  isApproved ? 0x00ff00 : 0x484a48;
export const MAL_LOGO =
  'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png';

export const GENRES_PER_PAGE = 10;
export const EPISODES_PER_PAGE = 10;

// API URLs
export const JIKAN_ANIME_SEARCH = `${JIKAN_API}/${JIKAN_VERSION}/anime`;
export const JIKAN_MANGA_SEARCH = `${JIKAN_API}/${JIKAN_VERSION}/manga`;
export const JIKAN_CHARACTER_SEARCH = `${JIKAN_API}/${JIKAN_VERSION}/characters`;
export const JIKAN_PEOPLE_SEARCH = `${JIKAN_API}/${JIKAN_VERSION}/people`;
export const JIKAN_GENRES_ANIME = `${JIKAN_API}/${JIKAN_VERSION}/genres/anime`;
export const JIKAN_GENRES_MANGA = `${JIKAN_API}/${JIKAN_VERSION}/genres/manga`;

export const ANIME_CHARACTERS = (id: string) =>
  `${JIKAN_API}/${JIKAN_VERSION}/anime/${id}/characters`;
export const ANIME_EPISODES = (id: string) =>
  `${JIKAN_API}/${JIKAN_VERSION}/anime/${id}/episodes`;
export const ANIME_THEMES = (id: string) =>
  `${JIKAN_API}/${JIKAN_VERSION}/anime/${id}/themes`;
export const ANIME_STAFF = (id: string) =>
  `${JIKAN_API}/${JIKAN_VERSION}/anime/${id}/staff`;
export const ANIME_STATISTICS = (id: string) =>
  `${JIKAN_API}/${JIKAN_VERSION}/anime/${id}/statistics`;
export const MANGA_CHARACTERS = (id: string) =>
  `${JIKAN_API}/${JIKAN_VERSION}/manga/${id}/characters`;
export const MANGA_STATISTICS = (id: string) =>
  `${JIKAN_API}/${JIKAN_VERSION}/manga/${id}/statistics`;

// Search choices
export const ANIME_QUERY_TYPE = [
  'tv',
  'movie',
  'ova',
  'special',
  'ona',
  'music',
];
export const ANIME_QUERY_STATUS = ['airing', 'complete', 'upcoming'];
export const ANIME_QUERY_RATING = ['g', 'pg', 'pg13', 'r17', 'r', 'rx'];
export const ANIME_QUERY_ORDER_BY = [
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
export const MANGA_QUERY_TYPE = [
  'manga',
  'novel',
  'lightnovel',
  'oneshot',
  'doujin',
  'manhwa',
  'manhua',
];
export const MANGA_QUERY_STATUS = [
  'publishing',
  'complete',
  'hiatus',
  'discontinued',
  'upcoming',
];
export const MANGA_QUERY_ORDER_BY = [
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
export const CHARACTER_QUERY_ORDER_BY = ['mal_id', 'name', 'favorites'];
export const PEOPLE_QUERY_ORDER_BY = [
  'mal_id',
  'name',
  'birthday',
  'favorites',
];
export const SORT = ['desc', 'asc'];
export const JIKAN_GENRES_FILTER = [
  'genres',
  'explicit_genres',
  'themes',
  'demographics',
];

export const MAL_ANIME_STATUS_COLORS: Record<string, number> = {
  watching: 0x2db039,
  completed: 0x26448f,
  on_hold: 0xf1c83e,
  dropped: 0xa12f31,
  plan_to_watch: 0xc3c3c3,
};
export const MAL_MANGA_STATUS_COLORS: Record<string, number> = {
  reading: 0x2db039,
  completed: 0x26448f,
  on_hold: 0xf1c83e,
  dropped: 0xa12f31,
  plan_to_read: 0xc3c3c3,
};
