export interface IFxTiktokResponse {
  id: string;
  url: string;
  uri: string;
  created_at: Date;
  content: string;
  spoiler_text: string;
  language: any;
  visibility: string;
  application: Application;
  media_attachments: MediaAttachment[];
  account: Account;
  mentions: any[];
  tags: any[];
  emojis: any[];
  card: any;
  poll: any;
}

export interface Account {
  id: string;
  display_name: string;
  username: string;
  acct: string;
  url: string;
  created_at: Date;
  locked: boolean;
  bot: boolean;
  discoverable: boolean;
  indexable: boolean;
  group: boolean;
  avatar: string;
  avatar_static: string;
  header: any;
  header_static: any;
  statuses_count: number;
  hide_collections: boolean;
  noindex: boolean;
  emojis: any[];
  roles: any[];
  fields: any[];
}

export interface Application {
  name: string;
  website: string;
}

export interface MediaAttachment {
  id: string;
  type: MediaType;
  url: string;
  preview_url: string;
  remote_url: any;
  preview_remote_url: any;
  text_url: any;
  description: any | string;
  meta: Metadata;
}

export interface Metadata {
  original: Dimensions;
}

export interface Dimensions {
  width: number;
  height: number;
}

export type MediaType = "image" | "video";
