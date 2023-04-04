import { IEnemy } from './enemy';

export interface IRaid {
  Id: number;
  IsReleased: boolean[];
  MaxDifficulty: number[];
  PathName: string;
  Faction: string;
  Terrain: Terrain[];
  BulletType: Type;
  BulletTypeInsane: string;
  ArmorType: Type;
  EnemyList: Array<number[]>;
  BossList?: Array<IEnemy[]>;
  RaidSkill: RaidSkill[];
  ExcludeNormalAttack: number[];
  Name: string;
  Profile: string;
  Icon?: string;
  IconBG?: string;
}

export type Type = 'LightArmor' | 'Unarmed' | 'HeavyArmor' | 'Normal';

export interface RaidSkill {
  Id: string;
  SkillType: SkillType;
  MinDifficulty?: number;
  ATGCost: number;
  Icon: string;
  Effects?: Effect[];
  Name?: string;
  Desc?: string;
  Parameters?: Array<string[]>;
  ShowInfo?: boolean;
  EffectCombine?: EffectCombine[];
  EffectCombineLabel?: EffectCombineLabel;
}

export type EffectCombine =
  | 'DMGSingle'
  | 'DMGZone'
  | 'DMGMulti'
  | 'BuffAlly'
  | 'BuffTarget'
  | 'DMGDot'
  | 'CrowdControl';

export interface EffectCombineLabel {
  StackLabel?: string[];
  Icon?: string[];
  StackLabelTranslated?: StackLabelTranslated[];
  DisableFirst?: boolean;
}

export type StackLabelTranslated = 'setting_off' | 'setting_on';

export interface Effect {
  Type: EffectCombine;
  Scale?: number | number[];
  RestrictTo?: number[];
  CriticalCheck?: CriticalCheck;
  CanEvade?: boolean;
  HitFrames?: number[];
  Hits?: number[];
  Value?: Array<number[]>;
  Stat?: string;
  Channel?: number;
  SubstituteCondition?: string;
  SubstituteScale?: Array<number[]>;
  Duration?: string;
  Period?: string;
  Icon?: string;
  StackSame?: number;
  Chance?: string;
}

export type CriticalCheck = 'Check' | 'Never';

export type SkillType = 'EX' | 'Passive' | 'raidautoattack';

export type Terrain = 'Outdoor' | 'Street' | 'Indoor';

export interface IRaidSeason {
  Seasons: Season[];
  RewardSets: { [key: string]: Array<RewardSet[]> };
}

export type RewardSet = Array<number[]> | number;

export interface Season {
  RegionId?: number;
  Season: number;
  RaidId: number;
  Terrain: Terrain;
  Start: number;
  End: number;
  RewardSet: number;
  RewardSetMax: number;
}

export interface ITimeAttack {
  Id: number;
  IsReleased: boolean[];
  DungeonType: DungeonType;
  Icon: Icon;
  MaxDifficulty: number;
  Terrain: Terrain;
  BulletType: Type;
  ArmorType: Type;
  EnemyLevel: number[];
  Formations: Formation[];
  Rules: Array<number[] | TimeAttackRule[]>;
}

export type DungeonType = 'Shooting' | 'Defense' | 'Destruction';

export interface Formation {
  Id: number;
  Level: number[];
  Grade: number[];
  EnemyList: number[];
}

export type Icon =
  | 'EnemyInfo_Boxcat_Terror'
  | 'EnemyInfo_Sweeper_Decagram_Taser_White'
  | 'EnemyInfo_Totem03_TimeAttack';

export interface TimeAttackRule {
  Id?: number;
  Icon: string;
  Name: string;
  Desc: string;
}

export interface IWorldRaid {
  Id: number;
  IsReleased: boolean[];
  DifficultyMax: number[];
  DifficultyName: string[];
  PathName: string;
  IconBG: string;
  Terrain: Terrain[];
  BulletType: Type;
  ArmorType: Type;
  WorldBossHP?: number;
  Level: number[];
  EnemyList: Array<number[]>;
  RaidSkill: WorldRaidSkill[];
  Name: string;
  Rewards: Reward[];
  EntryCost: Array<number[]>;
  RewardsGlobal?: Reward[];
  BulletTypeInsane?: string;
  UseRaidSkillList?: number;
}

export interface WorldRaidSkill {
  Id: string;
  SkillType: SkillType;
  MinDifficulty: number;
  ATGCost: number;
  Icon: string;
  Name: string;
  Desc: string;
}

export interface Reward {
  Items: Array<number[]>;
  Groups: Array<Group[]>;
}

export type Group = Array<number[]> | number;
