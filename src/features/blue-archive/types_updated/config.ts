import { IStudent } from './student';

export interface IConfig {
  build: number;
  Regions: Region[];
  CommonFavorItemTags: string[];
  TypeEffectiveness: TypeEffectiveness;
  PotentialMaterial: PotentialMaterial[];
}

export interface PotentialMaterial {
  CostAmount: number;
  ArtifactGrade: number;
  ArtifactAmount: number;
  BookAmount: number;
}

export interface Region {
  Name: string;
  StudentMaxLevel: number;
  WeaponMaxLevel: number;
  BondMaxLevel: number;
  EquipmentMaxLevel: number[];
  GearUnlock: boolean;
  GearBondReq: number[];
  PotentialMax: number;
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
  UseNewCalculationLimit: boolean;
  studentsCount?: number; // custom field
  raidsCount?: number; // custom field
  eventsCount?: number; // custom field
  rerunEventsCount?: number; // custom field
  incomingBirthdayStudents?: Array<IStudent>; // custom field
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
  start: number;
  end: number;
}

export interface TypeEffectiveness {
  Normal: Chemical;
  Explosion: Chemical;
  Pierce: Chemical;
  Mystic: Chemical;
  Sonic: Chemical;
  Chemical: Chemical;
}

export interface Chemical {
  LightArmor: number;
  HeavyArmor: number;
  Unarmed: number;
  Structure: number;
  ElasticArmor: number;
  CompositeArmor: number;
  Normal: number;
}
