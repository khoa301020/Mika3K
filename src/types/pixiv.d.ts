export interface IPixivRefreshTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
  user: User;
  response?: IPixivRefreshTokenResponse;
}

export interface User {
  profile_image_urls: ProfileImageUrls;
  id: string;
  name: string;
  account: string;
  mail_address: string;
  is_premium: boolean;
  x_restrict: number;
  is_mail_authorized: boolean;
}

export interface ProfileImageUrls {
  px_16x16: string;
  px_50x50: string;
  px_170x170: string;
}

/* Pixiv Illust Response */
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
  user: User;
  tags: Tag[];
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

export interface MetaSinglePage {}

export interface Tag {
  name: string;
  translated_name: null | string;
}

export interface User {
  id: number;
  name: string;
  account: string;
  profile_image_urls: ProfileImageUrls;
  is_followed: boolean;
}

export interface ProfileImageUrls {
  medium: string;
}
