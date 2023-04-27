export interface INHentai {
  id: number;
  title: Title;
  images: Images;
  media_id: string;
  scanlator: string;
  upload_date: string;
  tags: Tag[];
  num_pages: number;
  num_favorites: number;
  upload_time: string;
  hits: number;
  _id: number;
  lang: string;
  related: any[];
}

export interface Images {
  cover: Cover;
  pages: Cover[];
  thumbnail: Cover;
}

export interface Cover {
  t: string;
  w: number;
  h: number;
}

export interface Tag {
  id: number;
  url: string;
  name: string;
  type: string;
  count: number;
}

export interface Title {
  english: string;
  japanese: string;
  pretty: string;
}
