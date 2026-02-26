export interface IWorldRaid {
  Id: number;
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
  RaidSkill: RaidSkill[];
  HasNormalAttack: any[];
  Name: string;
  Rewards: Reward[];
  RewardsRerun?: Reward[];
  EntryCost: Array<number[]>;
  BattleDuration: number[];
  RewardsGlobal: Reward[];
  RewardsRerunGlobal?: Reward[];
  BulletTypeInsane?: string;
  UseRaidSkillList?: number;
}

export type BulletType = 'Normal' | 'Hard' | 'VeryHard' | 'HardCore' | 'Extreme' | 'Insane';

export interface RaidSkill {
  Id: string;
  SkillType: SkillType;
  MinDifficulty: number;
  ATGCost: number;
  Icon: string;
  Name: string;
  Desc: string;
  Effects?: Effect[];
}

export interface Effect {
  Type: string;
  Scale: Array<number[] | number>;
  RestrictTo: number[];
  CriticalCheck?: string;
  CanEvade?: boolean;
  Hits?: number[];
  Chance?: string;
  Icon?: string;
}

export type SkillType = 'EX' | 'Passive';

export interface Reward {
  Items: Array<number[]>;
  Groups: Array<Array<Array<number[]> | number>>;
}
