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
  Size?: Size | null;
  BodyRadius?: number;
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
  SightPoint?: number;
  MoveSpeed: number;
  RegenCost: number;
  TSAId?: number;
  IgnoreDelayCount?: number;
  TacticRole?: null;
  StarBonus?: boolean;
}

export type Size = 'Large' | 'Medium';

export interface Skill {
  Type: SkillType;
  Effects: Effect[];
  Frames?: Frames;
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
  Block?: number;
  DescParamId?: number;
  Target?: string;
  IgnoreDef?: number[];
  Chance?: number;
  Icon?: string;
}

export type EffectType = 'Damage' | 'Heal' | 'CrowdControl';

export interface Frames {
  AttackEnterDuration: number;
  AttackStartDuration: number;
  AttackEndDuration: number;
  AttackBurstRoundOverDelay: number;
  AttackIngDuration: number;
  AttackReloadDuration: number;
}

export interface Radius {
  Type: RadiusType;
  Radius: number;
  Degree?: number;
}

export type RadiusType = 'Circle' | 'Fan' | 'Bounce';

export type SkillType = 'Normal' | 'Public' | 'Passive' | 'ExtraPassive';

export type ISummonType = 'Vehicle' | 'Summoned' | 'Obstacle';
