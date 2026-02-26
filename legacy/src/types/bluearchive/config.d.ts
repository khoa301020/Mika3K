import { IStudent } from './student';

export interface IConfig {
  links: Link[];
  build: number;
  Regions: Region[];
  CommonFavorItemTags: string[];
  TypeEffectiveness: TypeEffectiveness;
  GachaGroups: GachaGroup[];
}

export interface Changelog {
  date: string;
  contents: string[];
}

export interface GachaGroup {
  Id: number;
  ItemList: Array<number[]>;
}

export interface Region {
  Name: string;
  StudentMaxLevel: number;
  WeaponMaxLevel: number;
  BondMaxLevel: number;
  EquipmentMaxLevel: number[];
  GearUnlock: boolean;
  GearBondReq: number[];
  CampaignMax: number;
  CampaignExtra: boolean;
  Events: number[];
  Event701Max: number[];
  ChaserMax: number;
  BloodMax: number;
  FindGiftMax: number;
  SchoolDungeonMax: number;
  FurnitureSetMax: number;
  FurnitureTemplateMax: number;
  CurrentGacha: CurrentGacha[];
  CurrentEvents: CurrentEvent[];
  CurrentRaid: CurrentRaid[];
  studentsCount?: number;
  raidsCount?: number;
  eventsCount?: number;
  rerunEventsCount?: number;
  incomingBirthdayStudents?: Array<IStudent>;
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
  type: string;
  raid: number;
  terrain: string;
  season: number;
  start: number;
  end: number;
}

export interface TypeEffectiveness {
  Normal: ArmorEffectiveness;
  Explosion: ArmorEffectiveness;
  Pierce: ArmorEffectiveness;
  Mystic: ArmorEffectiveness;
  Sonic: ArmorEffectiveness;
}

export interface ArmorEffectiveness {
  LightArmor: number;
  HeavyArmor: number;
  Unarmed: number;
  Structure: number;
  ElasticArmor: number;
  Normal: number;
}

export interface Link {
  section: string;
  content: Content[];
}

export interface Content {
  title: string;
  description: string;
  url: string;
  author: string;
}
