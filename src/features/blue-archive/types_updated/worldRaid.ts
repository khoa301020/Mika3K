export interface IWorldRaid {
  Id: number;
  EventId: number;
  IsReleased: boolean[];
  MaxDifficulty: number[];
  DifficultyName: BulletType[];
  PathName: string;
  IconBG: string;
  Terrain: string[];
  BulletType: BulletType;
  ArmorType: string;
  WorldBossHP?: number;
  Level: number[];
  EnemyList: Array<number[]>;
  RaidSkillList: Array<string[]>;
  Name: string;
  Rewards: Array<Reward[]>;
  RewardsRerun?: Array<Reward[]>;
  EntryCost: Array<number[]>;
  BattleDuration: number[];
  RewardsGlobal: Array<Reward[]>;
  RewardsRerunGlobal?: Array<Reward[]>;
  DevName: string;
  BulletTypeInsane?: string;
}

export type BulletType =
  | 'Normal'
  | 'Hard'
  | 'VeryHard'
  | 'HardCore'
  | 'Extreme'
  | 'Insane';

export interface Reward {
  Type: Type;
  Id: number;
  Chance?: number;
  Amount?: number;
}

export type Type = 'Item' | 'Equipment' | 'Currency' | 'GachaGroup';
