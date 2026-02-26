export interface IRaid {
  Id: number;
  IsReleased: boolean[];
  MaxDifficulty: number[];
  PathName: string;
  GroupName: string;
  Faction: string;
  Terrain: Terrain[];
  BulletType: BulletType;
  BulletTypeInsane: BulletTypeInsane;
  ArmorType: string;
  EnemyList: Array<number[]>;
  BossList?: Array<IEnemy[]>; // custom property
  RaidSkill: RaidSkill[];
  HasNormalAttack: number[];
  BattleDuration: number[];
  Name: string;
  Profile: string;
  Icon?: string;
  IconBG?: string;
}

export type BulletType = 'Normal';

export type BulletTypeInsane = 'Pierce' | 'Explosion' | 'Mystic';

export interface RaidSkill {
  Id: string;
  SkillType: SkillType;
  MinDifficulty?: number;
  ATGCost: number;
  Icon: string;
  ShowInfo?: boolean;
  Effects?: Effect[];
  Name?: string;
  Desc?: string;
  Parameters?: Array<string[]>;
  MaxDifficulty?: number;
  EffectCombine?: EffectCombine[];
  EffectCombineLabel?: EffectCombineLabel;
  EffectStackLabel?: EffectStackLabel;
}

export type EffectCombine =
  | 'DMGSingle'
  | 'DMGZone'
  | 'DMGMulti'
  | 'BuffAlly'
  | 'BuffTarget'
  | 'CrowdControl'
  | 'DMGDot';

export interface EffectCombineLabel {
  StackLabel?: string[];
  StackLabelTranslated?: string[];
  Icon?: string[];
  DisableFirst?: boolean;
}

export interface EffectStackLabel {
  Label?: string[];
  Icon?: string[];
}

export interface Effect {
  Type: EffectCombine;
  Scale?: Array<number[] | number>;
  RestrictTo?: number[];
  CriticalCheck?: CriticalCheck;
  CanEvade?: boolean;
  HitFrames?: number[];
  Hits?: number[];
  Value?: Array<number[]>;
  Stat?: string;
  Channel?: number;
  CombineGroup?: number;
  Chance?: string;
  Icon?: string;
  SubstituteCondition?: string;
  SubstituteScale?: Array<number[]>;
  Duration?: string;
  Period?: string;
  StackSame?: number;
  StackingIcon?: string[];
}

export type CriticalCheck = 'Check' | 'Never' | 'Always';

export type SkillType = 'raidautoattack' | 'EX' | 'Passive' | 'normal';

export type Terrain = 'Outdoor' | 'Street' | 'Indoor';
