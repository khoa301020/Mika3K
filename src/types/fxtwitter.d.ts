/* This file contains types relevant to FixTweet and the FixTweet API
   For Twitter API types, see twitterTypes.d.ts */

import { Context } from 'hono';
import { DataProvider } from '../enum';

export interface TweetAPIResponse {
  code: number;
  message: string;
  tweet?: APITwitterStatus;
}

export interface StatusAPIResponse {
  code: number;
  message: string;
  status?: APITwitterStatus;
}

export interface UserAPIResponse {
  code: number;
  message: string;
  user?: APIUser;
}

export interface APITranslate {
  text: string;
  source_lang: string;
  source_lang_en: string;
  target_lang: string;
  provider: string;
}

export interface APIExternalMedia {
  type: 'video';
  url: string;
  thumbnail_url?: string;
  height?: number;
  width?: number;
}

export interface APIPollChoice {
  label: string;
  count: number;
  percentage: number;
}

export interface APIPoll {
  choices: APIPollChoice[];
  total_votes: number;
  ends_at: string;
  time_left_en: string;
}

export interface APIMedia {
  type: string;
  url: string;
  width: number;
  height: number;
}

export interface APIPhoto extends APIMedia {
  type: 'photo' | 'gif';
  transcode_url?: string;
  altText?: string;
}

export interface APIVideo extends APIMedia {
  type: 'video' | 'gif';
  thumbnail_url: string;
  format: string;
  duration: number;
  variants: TweetMediaFormat[];
}

export interface APIMosaicPhoto extends APIMedia {
  type: 'mosaic_photo';
  formats: {
    webp: string;
    jpeg: string;
  };
}

export interface APIStatus {
  id: string;
  url: string;
  text: string;
  created_at: string;
  created_timestamp: number;

  likes: number;
  retweets: number;
  replies: number;

  quote?: APIStatus;
  poll?: APIPoll;
  author: APIUser;

  media: {
    external?: APIExternalMedia;
    photos?: APIPhoto[];
    videos?: APIVideo[];
    all?: APIMedia[];
    mosaic?: APIMosaicPhoto;
  };

  raw_text: {
    text: string;
    facets: APIFacet[];
  };

  lang: string | null;
  translation?: APITranslate;

  possibly_sensitive: boolean;

  // replying_to: {
  //   screen_name: string;
  //   post: string;
  // } | null;

  replying_to?: string;
  replying_to_status?: string;

  source: string | null;

  embed_card: 'tweet' | 'summary' | 'summary_large_image' | 'player';
  provider: DataProvider;
}

export interface APIFacet {
  type: string;
  indices: [start: number, end: number];
  original?: string;
  replacement?: string;
  display?: string;
  id?: string;
}

export interface APITwitterCommunityNote {
  text: string;
  entities: BirdwatchEntity[];
}

export interface APITwitterStatus extends APIStatus {
  views?: number | null;
  bookmarks?: number | null;

  is_note_tweet: boolean;
  community_note: APITwitterCommunityNote | null;
  provider: DataProvider.Twitter;
}

export interface APIBlueskyStatus extends APIStatus {
  provider: DataProvider.Bsky;
}

export interface APIUser {
  id: string;
  name: string;
  screen_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  // verified: 'legacy' | 'blue'| 'business' | 'government';
  // verified_label: string;
  description: string;
  location: string;
  url: string;
  protected: boolean;
  followers: number;
  following: number;
  tweets: number;
  media_count: number;
  likes: number;
  joined: string;
  website: {
    url: string;
    display_url: string;
  } | null;
  birthday: {
    day?: number;
    month?: number;
    year?: number;
  };
  verification?: {
    verified: boolean;
    type: 'organization' | 'government' | 'individual' | null;
  };
}