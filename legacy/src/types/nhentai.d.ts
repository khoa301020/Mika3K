/* NHentai Modules API */
export interface INHentaiModulesResponse {
  status: number;
  data: INHentaiModulesData | INHentaiModulesGallery;
}

export interface INHentaiModulesData {
  num_pages: number;
  per_page: number;
  result: INHentaiModulesResult[];
}

export interface INHentaiModulesResult {
  id: number | string;
  title: Title;
  num_pages: number;
  lang: Lang;
  cover: string;
  media_id: string;
  pages_string: string;
  current_search_page?: number;
  total_search_page?: number;
}

export type Lang = 'english' | 'japanese' | 'chinese';

export interface INHentaiModulesGallery {
  id: number;
  title: Title;
  images: Images;
  media_id: string;
  scanlator: string;
  upload_date: string;
  tags: Array<Tag>;
  num_pages: number;
  num_favorites: number;
  upload_time: string;
  hits: number;
  _id: number;
  lang: string;
  related?: Array<any>;
}

/* NHentai Origin API */
export interface INHentaiList {
  result: INHentai[];
  num_pages?: number;
  per_page?: number;
}
export interface INHentai {
  id: ID;
  media_id: string;
  title: Title;
  images: Images;
  scanlator: string;
  upload_date: number;
  tags: Tag[];
  num_pages: number;
  num_favorites: number;
  current_search_page?: number;
  total_search_page?: number;
}

export type ID = number | string;

export interface Images {
  pages: Cover[];
  cover: Cover;
  thumbnail: Cover;
}

export interface Cover {
  t: T;
  w: number;
  h: number;
}

export type T = 'j' | 'p';

export interface Tag {
  id: number;
  type: Type;
  name: string;
  url: string;
  count: number;
}

export type Type = 'tag' | 'language' | 'artist' | 'category' | 'parody' | 'character' | 'group';

export interface Title {
  english: string;
  japanese: null | string;
  pretty: string;
}

export type INHentaiQueryKey = Type;

export type INHentaiQuerySort = 'popular' | 'popular-today' | 'popular-week' | 'popular-month' | 'recent';

export interface INHentaiQueryParam {
  tag?: Array<string>;
  artist?: Array<string>;
  character?: Array<string>;
  category?: Array<string>;
  parody?: Array<string>;
  group?: Array<string>;
  language?: Array<string>;
}
