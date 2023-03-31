export interface ICommon {
  GachaGroup: GachaGroup[];
  regions: Region[];
}

export interface GachaGroup {
  Id: number;
  ItemList: Array<number[]>;
  Icon?: string;
  NameEn?: string;
  NameJp?: string;
  Rarity?: string;
}

export interface Region {
  name: string;
  studentlevel_max: number;
  weaponlevel_max: number;
  bondlevel_max: number;
  gear1_max: number;
  gear2_max: number;
  gear3_max: number;
  campaign_max: number;
  events: number[];
  event_701_max: number;
  event_701_challenge_max: number;
  commission_max: number;
  bounty_max: number;
  schooldungeon_max: number;
  current_gacha: CurrentGacha[];
  current_events: CurrentEvent[];
  current_raid: CurrentRaid[];
}

export interface CurrentEvent {
  event: number;
  start: number;
  end: number;
}

export interface CurrentGacha {
  characters: number[];
  start: number;
  end: number;
}

export interface CurrentRaid {
  raid: number;
  terrain?: string;
  start: number;
  end: number;
}
