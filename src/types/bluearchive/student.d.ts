////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////   IStudent   /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export interface IStudent {
  Id: number;
  IsReleased: boolean[];
  DefaultOrder: number;
  PathName: string;
  DevName: string;
  Name: string;
  School: School;
  SchoolLong?: string;
  Club: string;
  StarGrade: number;
  SquadType: SquadType;
  TacticRole: TacticRole;
  TacticRoleLong?: string;
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
  CollectionTexture: string;
  FamilyName: string;
  FamilyNameRuby: string;
  PersonalName: string;
  SchoolYear: SchoolYear;
  CharacterAge: CharacterAge;
  Birthday: string;
  CharacterSSRNew: string;
  ProfileIntroduction: string;
  Hobby: string;
  CharacterVoice: string;
  BirthDay: string;
  ArtistName: string;
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
  FurnitureInteraction: Array<number[]>;
  FavorItemTags: string[];
  FavorItemUniqueTags: string[];
  IsLimited: number;
  Weapon: Weapon;
  Gear: Gear;
  SkillExMaterial: Array<number[]>;
  SkillExMaterialAmount: Array<number[]>;
  SkillMaterial: Array<number[]>;
  SkillMaterialAmount: Array<number[]>;
}

export type ArmorType = 'LightArmor' | 'HeavyArmor' | 'Unarmed' | 'ElasticArmor';

export type BulletType = 'Explosion' | 'Mystic' | 'Pierce';

export type CharacterAge =
  | '16 years old'
  | '15 years old'
  | '17 years old'
  | 'Top Secret'
  | '18 years old'
  | 'Age Unknown'
  | '11 years old';

export type Equipment = 'Hat' | 'Hairpin' | 'Watch' | 'Shoes' | 'Bag' | 'Charm' | 'Necklace' | 'Gloves' | 'Badge';

export type FavorStatType = 'AttackPower' | 'MaxHP' | 'DefensePower' | 'HealPower' | 'CriticalPoint';

export interface Gear {
  Released?: boolean[];
  StatType?: string[];
  StatValue?: Array<number[]>;
  Name?: string;
  Desc?: string;
  Icon?: string;
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
  | 'Arius';

export type SchoolYear = '2nd Year' | '1st Year' | '3rd Year' | '' | 'Suspended';

export interface Skill {
  SkillType: SkillType;
  Effects: Effect[];
  Name?: string;
  Desc?: string;
  Parameters?: Array<string[]>;
  Cost?: number[];
  Icon?: string;
  EffectCombine?: EffectCombine[];
  EffectCombineLabel?: EffectCombineLabel;
}

export type EffectCombine =
  | 'DMGSingle'
  | 'BuffSelf'
  | 'DMGMulti'
  | 'HealDot'
  | 'CrowdControl'
  | 'BuffTarget'
  | 'DMGEcho'
  | 'Shield'
  | 'Heal'
  | 'DMGEchoWithScaling'
  | 'FormChange'
  | 'DMGZone'
  | 'DMGDot'
  | 'IgnoreDelay'
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

export interface Effect {
  Type: EffectCombine;
  Hits?: number[];
  Scale?: number[];
  Frames?: Frames;
  CriticalCheck?: CriticalCheck;
  Stat?: string;
  Duration?: string;
  Period?: string;
  HitsParameter?: number;
  Chance?: string;
  Icon?: string;
  Value?: Array<number[]>;
  Channel?: number;
  SubstituteCondition?: string;
  SubstituteScale?: number[];
  HitFrames?: number[];
  StackSame?: number;
  IgnoreDef?: number[];
  Restrictions?: Restriction[];
  ZoneHitInterval?: number;
  ZoneDuration?: number;
  Critical?: number;
  HideFormChangeIcon?: boolean;
  SourceStat?: FavorStatType;
}

export type CriticalCheck = 'Check' | 'Always';

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

export interface Restriction {
  Property: string;
  Operand: Operand;
  Value: Value;
}

export type Operand = 'NotEqual' | 'Equal' | 'Contains';

export type Value = number | string;

export type SkillType = 'ex' | 'normal' | 'autoattack' | 'passive' | 'sub' | 'weaponpassive' | 'gearnormal';

export type SquadType = 'Main' | 'Support';

export interface Summon {
  Id: number;
  SourceSkill: SkillType;
  InheritCasterStat: FavorStatType[];
  InheritCasterAmount: Array<number[]>;
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
