export interface IPixivIllustResponse {
  illust: IPixivIllust;
}

export interface IPixivIllust {
  id: number;
  title: string;
  type: string;
  image_urls: ImageUrls;
  caption: string;
  restrict: number;
  user: IPixivUser;
  tags: IPixivTag[];
  tools: string[];
  create_date: Date;
  page_count: number;
  width: number;
  height: number;
  sanity_level: number;
  x_restrict: number;
  series: null;
  meta_single_page: MetaSinglePage;
  meta_pages: MetaPage[];
  total_view: number;
  total_bookmarks: number;
  is_bookmarked: boolean;
  visible: boolean;
  is_muted: boolean;
  total_comments: number;
  illust_ai_type: number;
  illust_book_style: number;
  comment_access_control: number;
}

export interface ImageUrls {
  square_medium: string;
  medium: string;
  large: string;
  original?: string;
}

export interface MetaPage {
  image_urls: ImageUrls;
}

export interface MetaSinglePage {
  original_image_url: string;
}

export interface IPixivTag {
  name: string;
  translated_name: null | string;
}

export interface IPixivUser {
  id: number;
  name: string;
  account: string;
  profile_image_urls: { medium: string };
  is_followed: boolean;
}
