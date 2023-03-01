export interface ISaucenaoSearchRequest {
  /**
   * Image URL
   */
  url: string;

  output_type: OutputType;

  /**
   * Allows using the API from anywhere regardless of whether the client is logged in, or supports cookies.
   */
  api_key: string;

  /**
   * Causes each index which has a match to output at most 1
   */
  testmode?: number;

  /**
   * Mask for selecting specific indexes to ENABLE. dbmask=8191 will search all of the first 14 indexes. If intending to search all databases, the db=999 option is more appropriate.
   */
  dbmask?: string;

  /**
   * Mask for selecting specific indexes to DISABLE. dbmaski=8191 would search only indexes higher than the first 14. This is ideal when attempting to disable only certain indexes, while allowing future indexes to be included by default.
   * Bitmask Note: Index numbers start with 0. Even though pixiv is labeled as index 5, it would be controlled with the 6th bit position, which has a decimal value of 32 when set.
   */
  dbmaski?: string;

  /**
   * search a specific index number or all without needing to generate a bitmask.
   */
  db?: number | 999;

  /**
   * search one or more specific index number, set more than once to search multiple.
   * (ex. dbs[]=4&dbs[]=5&dbs[]=12)
   */
  dbs?: Array<number>;

  /**
   * Change the number of results requested.
   */
  numres?: number;

  dedupe?: Dedupe;

  hide?: Hide;
}

/**
 * 0: html
 * 1: xml (not implemented)
 * 2: json
 */
enum OutputType {
  HTML = 0,
  XML = 1,
  JSON = 2,
}

/**
 * 0: no result deduping
 * 1: consolidate booru results and dedupe by item identifier
 * 2: all implemented dedupe methods such as by series name.
 */
enum Dedupe {
  NO_DEDUPE = 0,
  CONSOLIDATE = 1,
  ALL = 2,
}

/**
 * 0: show all
 * 1: hide expected explicit
 * 2: hide expected and suspected explicit
 * 3: hide all but expected safe
 */
enum Hide {
  SHOW_ALL = 0,
  HIDE_EXP_EXPLICIT = 1,
  HIDE_EXP_SUS_EXPLICIT = 2,
  HIDE_ALL_EXP_SAFE = 3,
}

export interface ISaucenaoSearchResponse {
  header?: ISaucenaoSearchResponseHeader;
  results?: Array<ISaucenaoSearchResponseResult>;
}

export interface ISaucenaoSearchResponseHeader {
  user_id?: string;
  account_type?: string;
  short_limit?: string;
  long_limit?: string;
  long_remaining?: number;
  short_remaining?: number;
  status?: number;
  results_requested?: string;
  index?: Array<ISaucenaoSearchResponseHeaderIndex>;
  search_depth?: string;
  minimum_similarity?: number;
  query_image_display?: string;
  query_image?: string;
  results_returned?: number;
  message?: string;
}

export interface ISaucenaoSearchResponseHeaderIndex {
  status?: number;
  parent_id?: number;
  id?: number;
  results?: number;
}

export interface ISaucenaoSearchResponseResult {
  header?: ISaucenaoSearchResponseResultHeader;
  data?: any;
}

// export interface ISaucenaoSearchResponseResult {
//   header?: ISaucenaoSearchResponseResultHeader;
//   data?:
//     | ISaucenaoSearchResponseResultDataArtstation
//     | ISaucenaoSearchResponseResultDataAniDB
//     | ISaucenaoSearchResponseResultDataDeviantArt
//     | ISaucenaoSearchResponseResultDataFakku
//     | ISaucenaoSearchResponseResultDataFurAffinity
//     | ISaucenaoSearchResponseResultDataHCG
//     | ISaucenaoSearchResponseResultDataHMisc
//     | ISaucenaoSearchResponseResultDataImdb
//     | ISaucenaoSearchResponseResultDataKemono
//     | ISaucenaoSearchResponseResultDataNHentai
//     | ISaucenaoSearchResponseResultDataMangaDex
//     | ISaucenaoSearchResponseResultDataMangaUpdates
//     | ISaucenaoSearchResponseResultDataPixiv
//     | ISaucenaoSearchResponseResultDataSkeb
//     | ISaucenaoSearchResponseResultDataTwitter;
// }

export interface ISaucenaoSearchResponseResultHeader {
  similarity?: string;
  thumbnail?: string;
  index_id?: number;
  index_name?: string;
  dupes?: number;
  hidden?: number;
}

/**
 * Index: 5, 6
 */
export interface ISaucenaoSearchResponseResultDataPixiv {
  ext_urls: Array<string>;
  title: string;
  pixiv_id: number;
  member_name: string;
  member_id: number;
}

/**
 * Index: 43
 */
export interface ISaucenaoSearchResponseResultDataKemono {
  ext_urls: Array<string>;
  published: string;
  title: string;
  service: string;
  service_name: string;
  id: string;
  user_id: string;
  user_name: string;
}

/**
 * Index: 2
 */
export interface ISaucenaoSearchResponseResultDataHCG {
  title: string;
  company: string;
  getchu_id: string;
}

/**
 * Index: 38
 */
export interface ISaucenaoSearchResponseResultDataHMisc {
  source: string;
  creator: Array<string>;
  eng_name: string;
  jp_name: string;
}

/**
 * Index: 18
 */
export interface ISaucenaoSearchResponseResultDataNHentai {
  source: string;
  creator: Array<string>;
  eng_name: string;
  jp_name: string;
}

/**
 * Index: 44
 */
export interface ISaucenaoSearchResponseResultDataSkeb {
  ext_urls: Array<string>;
  path: string;
  creator: string;
  creator_name: string;
  author_name: string | null;
  author_url: string;
}

/**
 * Index: 21, 22
 */
export interface ISaucenaoSearchResponseResultDataAniDB {
  ext_urls: Array<string>;
  source: string;
  anidb_aid: number;
  mal_id: number;
  anilist_id: number;
  part: string;
  year: string;
  est_time: string;
}

/**
 * Index: 34
 */
export interface ISaucenaoSearchResponseResultDataDeviantArt {
  ext_urls: Array<string>;
  title: string;
  da_id: string;
  author_name: string;
  author_url: string;
}

/**
 * Index: 40
 */
export interface ISaucenaoSearchResponseResultDataFurAffinity {
  ext_urls: Array<string>;
  title: string;
  fa_id: number;
  author_name: string;
  author_url: string;
}

/**
 * Index: 39
 */
export interface ISaucenaoSearchResponseResultDataArtstation {
  ext_urls: Array<string>;
  title: string;
  as_project: string;
  author_name: string;
  author_url: string;
}

/**
 * Index: 36
 */
export interface ISaucenaoSearchResponseResultDataMangaUpdates {
  ext_urls: Array<string>;
  mu_id: number;
  source: string;
  part: string;
  type: string;
}

/**
 * Index: 37
 */
export interface ISaucenaoSearchResponseResultDataMangaDex {
  ext_urls: Array<string>;
  md_id: string;
  mu_id: number;
  mal_id: number;
  source: string;
  part: string;
  artist: string;
  author: string;
}

/**
 * Index: 23, 24
 */
export interface ISaucenaoSearchResponseResultDataImdb {
  ext_urls: Array<string>;
  source: string;
  imdb_id: string;
  part: string | null;
  year: string;
  est_time: string;
}

/**
 * Index: 41
 */
export interface ISaucenaoSearchResponseResultDataTwitter {}

/**
 * Index: 16
 */
export interface ISaucenaoSearchResponseResultDataFakku {}
