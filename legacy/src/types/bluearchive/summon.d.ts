export interface ISummon {
  Id: number;
  Skills: Skill[];
  Name: string;
  DevName: string;
  Type: ISummonType;
  BulletType: string;
  ArmorType: string;
  StreetBattleAdaptation?: number;
  OutdoorBattleAdaptation?: number;
  IndoorBattleAdaptation?: number;
  WeaponType: null | string;
  StabilityPoint: number;
  StabilityRate?: number;
  AttackPower1: number;
  AttackPower100: number;
  MaxHP1: number;
  MaxHP100: number;
  DefensePower1: number;
  DefensePower100: number;
  HealPower1: number;
  HealPower100: number;
  DodgePoint: number;
  AccuracyPoint: number;
  CriticalPoint: number;
  CriticalDamageRate: number;
  AmmoCount: number;
  AmmoCost: number;
  Range: number;
  MoveSpeed: number;
  RegenCost: number;
  TacticRole?: null;
  StarBonus?: boolean;
}

export interface Skill {
  SkillType: SkillType;
  Effects: Effect[];
  Radius?: Radius[];
  Name?: string;
  Desc?: string;
  Parameters?: Array<string[]>;
  Duration?: number;
  Range?: number;
  Icon?: string;
  IsSummonSkill?: boolean;
}

export interface Effect {
  Type: EffectType;
  Hits?: number[];
  Scale: number[];
  Frames?: Frames;
  HitsParameter?: number;
  IgnoreDef?: number[];
  Chance?: number;
  Icon?: string;
}

export interface Frames {
  AttackEnterDuration: number;
  AttackStartDuration: number;
  AttackEndDuration: number;
  AttackBurstRoundOverDelay: number;
  AttackIngDuration: number;
  AttackReloadDuration: number;
}

export type EffectType = 'DMGSingle' | 'Heal' | 'DMGMulti' | 'CrowdControl';

export interface Radius {
  Type: RadiusType;
  Radius: number;
  Degree?: number;
}

export type RadiusType = 'Circle' | 'Fan' | 'Bounce';

export type SkillType = 'autoattack' | 'normal' | 'passive';

export type ISummonType = 'Vehicle' | 'Summoned' | 'Obstacle';
