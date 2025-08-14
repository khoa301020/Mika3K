export type TPaginationType = 'button' | 'menu';

export interface I18n {
  jp: string;
  en: string;
}

export type TDiscordTimestamp =
  | 'DEFAULT'
  | 'RELATIVE_TIME'
  | 'SHORT_TIME'
  | 'LONG_TIME'
  | 'SHORT_DATE'
  | 'LONG_DATE'
  | 'SHORT_DATETIME'
  | 'LONG_DATETIME';

export interface IDiscordPerks {
  name: string;
  uploadLimit: number; // in bytes
}