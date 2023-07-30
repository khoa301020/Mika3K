import { INHentaiQueryKey, INHentaiQuerySort } from '../types/nhentai';

export default class NHentaiConstants {
  /* NHentai constants */
  // public static readonly NHENTAI_BASE_API = 'https://nh.modules.my.id';
  public static readonly NHENTAI_BASE_URL = 'https://nhentai.net';
  public static readonly NHENTAI_BASE_API = this.NHENTAI_BASE_URL;
  public static readonly NHENTAI_KEEP_COOKIE_ALIVE_ENDPOINT = 'https://nhentai.net/api/gallery/1';
  public static readonly NHENTAI_SEARCH_ENDPOINT = (query: string) =>
    `${this.NHENTAI_BASE_API}/api/galleries/search?query=${query}`;
  public static readonly NHENTAI_GALLERY_ENDPOINT = (galleryId: number | string) =>
    `${this.NHENTAI_BASE_API}/api/gallery/${galleryId}`;
  public static readonly NHENTAI_RANDOM_ENDPOINT = `${this.NHENTAI_BASE_API}/api/gallery/random`;
  public static readonly NHENTAI_RELATED_ENDPOINT = (galleryId: number | string) =>
    `${this.NHENTAI_BASE_API}/api/gallery/${galleryId}/related`;
  public static readonly NHENTAI_LOGO = 'https://archive.org/download/nhentai-logo-3/nhentai-logo-3.jpg';
  public static readonly EXT_MAP: { [key: string]: string } = {
    j: 'jpg',
    p: 'png',
    g: 'gif',
  };
  public static readonly NHENTAI_COVER = (mediaId: number | string, ext: string = 'j') =>
    `https://i.nhentai.net/galleries/${mediaId}/1.${this.EXT_MAP[ext]}`;
  public static readonly NHENTAI_SORT_ARGS: Array<INHentaiQuerySort> = [
    'popular',
    'popular-today',
    'popular-week',
    'popular-month',
    'recent',
  ];
  public static readonly NHENTAI_TAG_KEYS: Array<INHentaiQueryKey> = [
    'tag',
    'category',
    'parody',
    'artist',
    'group',
    'language',
  ];
  public static readonly NHENTAI_EMBED_COLOR = {
    DEFAULT: 0x0099ff,
    DANGER: 0xff0000,
  };
  public static readonly NHENTAI_DANGEROUS_TAGS = ['guro', 'netorare', 'yaoi'];
}
