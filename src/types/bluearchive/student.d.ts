import { ISummon } from './summon';

export interface IStudent {
  Id: number;
  IsReleased: boolean[];
  DefaultOrder: number;
  PathName: string;
  DevName: string;
  Name: string;
  School: School;
  SchoolLong?: string; // custom property
  Club: string;
  StarGrade: number;
  SquadType: SquadType;
  TacticRole: TacticRole;
  TacticRoleLong?: string; // custom property
  Summons: Summon[];
  Position: Position;
  BulletType: BulletType;
  ArmorType: ArmorType;
  StreetBattleAdaptation: number;
  OutdoorBattleAdaptation: number;
  IndoorBattleAdaptation: number;
  WeaponType: WeaponType;
  WeaponImg: string;
  Cover: boolean;
  Equipment: Equipment[];
  CollectionBG: string;
  FamilyName: string;
  PersonalName: string;
  SchoolYear: SchoolYear;
  CharacterAge: CharacterAge;
  Birthday: string;
  CharacterSSRNew: string;
  ProfileIntroduction: string;
  Hobby: string;
  CharacterVoice: string;
  BirthDay: string;
  Illustrator: string;
  Designer: string;
  CharHeightMetric: string;
  CharHeightImperial: null | string;
  StabilityPoint: number;
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
  RegenCost: number;
  Skills: Skill[];
  FavorStatType: FavorStatType[];
  FavorStatValue: Array<number[]>;
  FavorAlts: number[];
  MemoryLobby: number[];
  MemoryLobbyBGM: string;
  FurnitureInteraction: Array<Array<number[]>>;
  FavorItemTags: string[];
  FavorItemUniqueTags: string[];
  IsLimited: number;
  Weapon: Weapon;
  Gear: Gear;
  SkillExMaterial: Array<number[]>;
  SkillExMaterialAmount: Array<number[]>;
  SkillMaterial: Array<number[]>;
  SkillMaterialAmount: Array<number[]>;
  TSAId?: number;
  DefensePenetration1?: number;
  DefensePenetration100?: number;
}

export type ArmorType = 'LightArmor' | 'HeavyArmor' | 'Unarmed' | 'ElasticArmor';

export type BulletType = 'Explosion' | 'Mystic' | 'Pierce' | 'Sonic';

export type CharacterAge =
  | '11 years old'
  | '12 years old'
  | '14 years old'
  | '15 years old'
  | '16 years old'
  | '17 years old'
  | '18 years old'
  | 'Top Secret'
  | 'Age Unknown'
  | 'Unknown';

export type Equipment = 'Hat' | 'Hairpin' | 'Watch' | 'Shoes' | 'Bag' | 'Charm' | 'Necklace' | 'Gloves' | 'Badge';

export type FavorStatType = 'AttackPower' | 'MaxHP' | 'DefensePower' | 'HealPower' | 'CriticalPoint';

export interface Gear {
  Released?: boolean[];
  StatType?: string[];
  StatValue?: Array<number[]>;
  Name?: string;
  Desc?: string;
  TierUpMaterial?: Array<number[]>;
  TierUpMaterialAmount?: Array<number[]>;
}

export type Position = 'Back' | 'Front' | 'Middle';

export type School =
  | 'Gehenna'
  | 'Millennium'
  | 'Trinity'
  | 'Abydos'
  | 'Shanhaijing'
  | 'Hyakkiyako'
  | 'RedWinter'
  | 'Valkyrie'
  | 'ETC'
  | 'SRT'
  | 'Arius'
  | 'Tokiwadai'
  | 'Sakugawa';

export type SchoolYear = '1st Year' | '2nd Year' | '3rd Year' | '' | 'Suspended';

export interface Skill {
  SkillType: SkillType;
  Effects: SkillEffect[];
  Name?: string;
  Desc?: string;
  Parameters?: Array<string[]>;
  Cost?: number[];
  Duration?: number;
  Range?: number;
  Radius?: SkillRadius[];
  Icon?: string;
  EffectCombine?: EffectCombine[];
  EffectCombineLabel?: EffectCombineLabel;
  ExtraSkills?: ExtraSkill[];
  InheritScale?: InheritScale;
  HideCalculation?: boolean;
}

export type EffectCombine =
  | 'DMGSingle'
  | 'BuffSelf'
  | 'DMGMulti'
  | 'HealDot'
  | 'Heal'
  | 'BuffTarget'
  | 'DMGEcho'
  | 'Knockback'
  | 'CrowdControl'
  | 'Shield'
  | 'DMGEchoWithScaling'
  | 'FormChange'
  | 'DMGZone'
  | 'DMGDot'
  | 'BuffAlly'
  | 'HealZone'
  | 'Accumulation'
  | 'DMGByHit';

export interface EffectCombineLabel {
  Icon?: string[];
  StackLabelTranslated?: string[];
  DisableFirst?: boolean;
  StackLabel?: string[];
}

export interface SkillEffect {
  Type: EffectCombine;
  Hits?: number[];
  Scale?: number[];
  Frames?: Frames;
  CriticalCheck?: CriticalCheck;
  Stat?: string;
  Value?: Array<number[]>;
  Channel?: number;
  Duration?: number;
  Period?: number;
  ExtraStatSource?: string;
  ExtraStatRate?: number[];
  HitsParameter?: number;
  Chance?: number;
  Icon?: string;
  SubstituteCondition?: string;
  SubstituteScale?: number[];
  MultiplySource?: string;
  MultiplierConstant?: number[];
  HitFrames?: number[];
  IgnoreDelay?: number[];
  StackSame?: number;
  IgnoreDef?: number[];
  OverrideSlot?: SkillType;
  Restrictions?: Restriction[];
  ZoneHitInterval?: number;
  ZoneDuration?: number;
  Critical?: number;
  HideFormChangeIcon?: boolean;
  SourceStat?: FavorStatType;
  ExtraDamageSource?: ExtraDamageSource;
}

export type CriticalCheck = 'Check' | 'Always';

export interface ExtraDamageSource {
  Side: string;
  Stat: string;
  Multiplier: number[];
  SliderTranslation: string;
  SliderStep: number[];
  SliderLabel: number[];
  SliderLabelSuffix: string;
  SimulatePerHit: boolean;
}

export interface Frames {
  AttackEnterDuration: number;
  AttackStartDuration: number;
  AttackEndDuration: number;
  AttackBurstRoundOverDelay: number;
  AttackIngDuration: number;
  AttackReloadDuration: number;
  AttackReadyStartDuration?: number;
  AttackReadyEndDuration?: number;
}

export type SkillType = 'ex' | 'normal' | 'autoattack' | 'gearnormal' | 'passive' | 'weaponpassive' | 'sub';

export interface Restriction {
  Property: Property;
  Operand: Operand;
  Value: number | string;
}

export type Operand = 'NotEqual' | 'Equal';

export type Property = 'Id' | 'SquadType' | 'Size' | 'BulletType' | 'ArmorType';

export interface ExtraSkill {
  Id: string;
  SkillType: SkillType;
  Name: string;
  Desc: string;
  Parameters: Array<string[]>;
  Radius?: ExtraSkillRadius[];
  Icon: string;
  Effects: ExtraSkillEffect[];
  Duration?: number;
  Range?: number;
  Cost?: number[];
  TSAId?: number;
  TSAName?: string; // custom property
}

export interface ExtraSkillEffect {
  Type: EffectCombine;
  CriticalCheck: CriticalCheck;
  Hits?: number[];
  HitsParameter?: number;
  Scale: number[];
  IgnoreDef?: number[];
  ApplyStability?: boolean;
}

export interface ExtraSkillRadius {
  Type: Type;
  Radius?: number;
  Width?: number;
  Height?: number;
}

export type Type = 'Circle' | 'Fan' | 'Obb' | 'Bounce' | 'Donut';

export interface InheritScale {
  Skill: SkillType;
  EffectId: number;
  Parameter: number;
}

export interface SkillRadius {
  Type: Type;
  Radius?: number;
  Degree?: number;
  Width?: number;
  Height?: number;
  ExcludeRadius?: number;
}

export type SquadType = 'Main' | 'Support';

export interface Summon {
  Id: number;
  SourceSkill: SkillType;
  InheritCasterStat: FavorStatType[];
  InheritCasterAmount: Array<number[]>;
  ObstacleMaxHP1?: number;
  ObstacleMaxHP100?: number;
  Info?: ISummon; // custom property
}

export type TacticRole = 'DamageDealer' | 'Tanker' | 'Supporter' | 'Healer' | 'Vehicle';

export interface Weapon {
  Name: string;
  Desc: string;
  AdaptationType: AdaptationType;
  AdaptationValue: number;
  AttackPower1: number;
  AttackPower100: number;
  MaxHP1: number;
  MaxHP100: number;
  HealPower1: number;
  HealPower100: number;
  StatLevelUpType: StatLevelUpType;
}

export type AdaptationType = 'Street' | 'Outdoor' | 'Indoor';

export type StatLevelUpType = 'Standard' | 'LateBloom' | 'Premature';

export type WeaponType = 'SR' | 'SG' | 'AR' | 'MG' | 'SMG' | 'HG' | 'GL' | 'MT' | 'RG' | 'RL' | 'FT';
