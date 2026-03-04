export interface IStudent {
  Id: number;
  IsReleased: boolean[];
  DefaultOrder: number;
  PathName: string;
  DevName: string;
  Name: string;
  Icon: null | string;
  SearchTags: string[];
  School: School;
  Club: string;
  StarGrade: number;
  SquadType: SquadType;
  TacticRole: TacticRole;
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
  Size: Size;
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
  SightPoint: number;
  RegenCost: number;
  Skills: Skills;
  FavorStatType: FavorStatType[];
  FavorStatValue: Array<number[]>;
  FavorAlts: number[];
  MemoryLobby: number[];
  MemoryLobbyBGM: number;
  FurnitureInteraction: Array<Array<number[]>>;
  FavorItemTags: string[];
  FavorItemUniqueTags: string[];
  IsLimited: number[];
  Weapon: Weapon;
  Gear: Gear;
  SkillExMaterial: Array<number[]>;
  SkillExMaterialAmount: Array<number[]>;
  SkillMaterial: Array<number[]>;
  SkillMaterialAmount: Array<number[]>;
  PotentialMaterial: number;
  ProfileIntroductionChange?: string;
  AltSprite?: boolean;
  DefensePenetration1?: number;
  DefensePenetration100?: number;
  LinkedCharacterId?: number;
  StyleId?: number;
  FamilyNameChange?: string;
}

export type ArmorType =
  | 'LightArmor'
  | 'HeavyArmor'
  | 'Unarmed'
  | 'ElasticArmor'
  | 'CompositeArmor';

export type BulletType = 'Explosion' | 'Mystic' | 'Pierce' | 'Sonic';

export type CharacterAge =
  | '16 years old'
  | '15 years old'
  | '17 years old'
  | 'Top Secret'
  | 'Unknown'
  | '18 years old'
  | '11 years old'
  | '14 years old'
  | '?? years old'
  | '12 years old';

export type Equipment =
  | 'Hat'
  | 'Hairpin'
  | 'Watch'
  | 'Shoes'
  | 'Bag'
  | 'Charm'
  | 'Necklace'
  | 'Gloves'
  | 'Badge';

export type FavorStatType =
  | 'AttackPower'
  | 'MaxHP'
  | 'DefensePower'
  | 'HealPower'
  | 'CriticalPoint';

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
  | 'SRT'
  | 'Arius'
  | 'Highlander'
  | 'Tokiwadai'
  | 'Valkyrie'
  | 'WildHunt'
  | 'ETC'
  | 'Sakugawa';

export type SchoolYear =
  | '2nd Year'
  | '1st Year'
  | '3rd Year'
  | 'Suspended'
  | 'Dropout'
  | '';

export type Size = 'Medium';

export interface Skills {
  Normal?: Normal;
  Ex: Ex;
  Public: Public;
  GearPublic?: GearPublic;
  Passive: Passive;
  WeaponPassive: Passive;
  ExtraPassive: ExtraPassive;
}

export interface Ex {
  Name: string;
  Desc: string;
  Parameters: Array<string[]>;
  Cost?: number[];
  Duration?: number;
  Range?: number;
  Radius?: ExRadius[];
  Icon: string;
  Effects: ExEffect[];
  SortHits?: number;
  ExtraSkills?: ExExtraSkill[];
  GroupLabel?: { [key: string]: ExGroupLabel };
  Selectable?: boolean;
  Id?: string;
  Type?: Type;
  Selection?: Selection;
}

export interface ExEffect {
  Type: PurpleType;
  Block?: number;
  CriticalCheck?: CriticalCheck;
  Hits?: number[];
  DescParamId?: number;
  Scale?: number[];
  Target?: Selection[] | TargetEnum;
  Duration?: number;
  Period?: number;
  ExtraStatSource?: string;
  ApplyFrame?: number;
  ExtraStatRate?: number[];
  Stat?: string;
  Channel?: number;
  Value?: Array<Array<ValueClass | number>>;
  StackLabel?: ExGroupLabel[];
  Key?: string;
  TargetHpRateModifier?: TargetHPRateModifier;
  Restrictions?: PurpleRestriction[];
  OverrideSkillType?: Type;
  StatModifier?: StatModifier;
  Chance?: number;
  Icon?: string;
  ValueType?: ValueType;
  Uses?: number;
  Condition?: PurpleCondition;
  SummonId?: number;
  CasterStat?: FavorStatType;
  Reposition?: Selection[];
  IgnoreDef?: number[];
  Group?: number;
  OverrideSlot?: OverrideSlot;
  HitFrames?: number[];
  Critical?: number;
  SourceStat?: FavorStatType;
  SubstituteCondition?: Type;
  SubstituteScale?: number[];
  StackSame?: number;
  HideFormChangeIcon?: boolean;
  Frames?: Frames;
  MultiplySource?: string;
  MultiplierConstant?: number[];
  ZoneHitInterval?: number;
  ZoneDuration?: number;
  ApplyStability?: boolean;
  ExcludeDesc?: boolean;
}

export interface PurpleCondition {
  Type: ConditionType;
  Parameter: string;
  Operand?: ConditionOperand;
  Value: number[] | boolean | number | string;
}

export type ConditionOperand = 'Equal' | 'NotEqual' | 'Exists';

export type ConditionType =
  | 'TargetProp'
  | 'BuffCount'
  | 'SkillLevel'
  | 'Special';

export type CriticalCheck = 'Check' | 'Never' | 'Always';

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

export type Type = 'Ex' | 'Passive' | 'Public' | 'GearPublic';

export type OverrideSlot = 'Passive' | 'HiddenPassive' | 'Public';

export type Selection = 'Self' | 'Enemy' | 'Ally' | 'AllyMain' | 'AllySupport';

export interface PurpleRestriction {
  Property: Property;
  Operand: PurpleOperand;
  Value: number[] | number | string;
}

export type PurpleOperand = 'Equal' | 'Between' | 'NotEqual' | 'NotBetween';

export type Property = 'ArmorType' | 'Id' | 'Size' | 'BulletType';

export interface ExGroupLabel {
  Icon?: Icon;
  Label?: string;
  Disabled?: boolean;
  IconClass?: IconClass;
  LabelTranslated?: LabelTranslated;
}

export type Icon =
  | 'buff/Special_CH0291_ExtraPassive.webp'
  | 'buff/Special_CH0317_ExtraPassive.webp'
  | 'buff/Special_CH0220_Public.webp'
  | 'schoolicon/Arius.png'
  | 'buff/Special_CH0304_ExtraPassive.webp'
  | 'buff/Special_EnergyBatteryEmpty.webp'
  | 'buff/Special_Holiday.webp'
  | 'buff/Special_EnergyBatteryHalf.webp'
  | 'buff/Special_EnergyBatteryFull.webp'
  | 'buff/Special_CH0275_Public.webp'
  | 'buff/Special_CH0187Mod.webp'
  | 'schoolicon/RedWinter.png'
  | 'buff/Special_Pray.webp'
  | 'buff/Special_CH0280_Ex_02.webp'
  | 'buff/Special_CH0259_ExtraPassive_01.webp'
  | 'buff/Special_CH0221_ExtraPassive.webp'
  | 'buff/Special_CH0271_Ex.webp'
  | 'student/icon/13011.webp'
  | 'buff/CC_Stunned.webp'
  | 'student/icon/10016.webp'
  | 'buff/Special_CH0257_Public.webp'
  | 'ui/Type_Defense.png'
  | 'buff/Debuff_ATK.webp'
  | 'buff/Buff_ATK.webp';

export type IconClass = 'p-1 bg-def-heavyarmor' | 'ba-item-n';

export type LabelTranslated = 'setting_on' | 'setting_off';

export interface StatModifier {
  Stat: string;
  Source: string;
  MinStatValue: number;
  MaxStatValue: number;
  MultiplierMin: number;
  MultiplierMax: number;
}

export type TargetEnum = 'Self' | 'Ally' | 'Any';

export interface TargetHPRateModifier {
  MinHpRate: number;
  MaxHpRate: number;
  MultiplierMin: number;
  MultiplierMax: number;
}

export type PurpleType =
  | 'Damage'
  | 'Accumulation'
  | 'Knockback'
  | 'Regen'
  | 'Buff'
  | 'Special'
  | 'Heal'
  | 'Shield'
  | 'CrowdControl'
  | 'CostChange'
  | 'Summon'
  | 'DamageDebuff'
  | 'Dispel'
  | 'ConcentratedTarget';

export interface ValueClass {
  ApplyCount: number;
  DamageRate: number;
  Interval: number;
}

export type ValueType = 'Coefficient' | 'BaseAmount';

export interface ExExtraSkill {
  Id?: string;
  Name: string;
  Desc: string;
  Parameters: Array<string[]>;
  Cost?: number[];
  Duration?: number;
  Range?: number;
  Radius?: ExtraSkillRadius[];
  Icon: string;
  Effects: PurpleEffect[];
  Type?: Type;
  Selection?: Selection;
  TSAId?: number;
  GroupLabel?: { [key: string]: GroupLabel };
}

export interface PurpleEffect {
  Type: PurpleType;
  Block?: number;
  CriticalCheck?: CriticalCheck;
  Hits?: number[];
  DescParamId?: number;
  Scale?: number[];
  Target?: Selection[] | TargetEnum;
  ApplyFrame?: number;
  Chance?: number;
  Icon?: string;
  MultiplySource?: string;
  MultiplierConstant?: number[];
  Condition?: FluffyCondition;
  Group?: number;
  Duration?: number;
  Period?: number;
  IgnoreDef?: number[];
  Reposition?: Selection[];
  ZoneHitInterval?: number;
  ZoneDuration?: number;
  Critical?: number;
  HideFormChangeIcon?: boolean;
  Frames?: Frames;
  HitFrames?: number[];
  ValueType?: ValueType;
  Uses?: number;
  ApplyStability?: boolean;
  StatModifier?: StatModifier;
  SummonId?: number;
  Value?: Array<number[]>;
  Stat?: string;
  CasterStat?: FavorStatType;
  Channel?: number;
  Restrictions?: FluffyRestriction[];
  Key?: string;
  SourceStat?: FavorStatType;
  StackLabel?: ExtraPassiveGroupLabel[];
  TargetHpRateModifier?: TargetHPRateModifier;
}

export interface FluffyCondition {
  Type: ConditionType;
  Parameter: string;
  Operand?: ConditionOperand;
  Value: number[] | boolean | string;
}

export interface FluffyRestriction {
  Property: Property;
  Operand: ConditionOperand;
  Value: string;
}

export interface ExtraPassiveGroupLabel {
  Icon?: Icon;
  Label: string;
  Disabled?: boolean;
}

export interface GroupLabel {
  Icon?: Icon;
  Label: string;
}

export interface ExtraSkillRadius {
  Type: RadiusType;
  Width?: number;
  Height?: number;
  Radius?: number;
}

export type RadiusType = 'Obb' | 'Circle' | 'Bounce' | 'Fan' | 'Donut';

export interface ExRadius {
  Type: RadiusType;
  Radius?: number;
  Width?: number;
  Height?: number;
  Degree?: number;
  ExcludeRadius?: number;
}

export interface ExtraPassive {
  Name: string;
  Desc: string;
  Parameters: Array<string[]>;
  Icon: string;
  Effects: ExtraPassiveEffect[];
  Radius?: ExtraPassiveRadius[];
  Duration?: number;
  Range?: number;
  Cost?: number[];
  GroupLabel?: { [key: string]: ExtraPassiveGroupLabel };
  ExtraSkills?: ExtraPassiveExtraSkill[];
  Id?: string;
  Type?: Type;
}

export interface ExtraPassiveEffect {
  Type: PurpleType;
  Target?: Selection[] | TargetEnum;
  Value?: Array<Array<ValueClass | number>>;
  Stat?: string;
  Channel?: number;
  Duration?: number;
  ApplyFrame?: number;
  Key?: string;
  Reposition?: Selection[];
  StackLabel?: ExGroupLabel[];
  Scale?: number[];
  StackSame?: number;
  Icon?: string;
  Chance?: number;
  Restrictions?: PurpleRestriction[];
  SummonId?: number;
  CasterStat?: FavorStatType;
  Period?: number;
  OverrideSlot?: OverrideSlot;
  ValueType?: ValueType;
  Uses?: number;
  Block?: number;
  CriticalCheck?: CriticalCheck;
  Hits?: number[];
  DescParamId?: number;
  Group?: number;
  Condition?: FluffyCondition;
  MultiplySource?: string;
  MultiplierConstant?: number[];
  Critical?: number;
  HideFormChangeIcon?: boolean;
  Frames?: Frames;
  SourceStat?: FavorStatType;
  TargetHpRateModifier?: TargetHPRateModifier;
  HitFrames?: number[];
  IgnoreDef?: number[];
  ExtraStatSource?: string;
  ExtraStatRate?: number[];
  OverrideSkillType?: Type;
  StatModifier?: StatModifier;
}

export interface ExtraPassiveExtraSkill {
  Id: string;
  Name: string;
  Desc: string;
  Parameters: Array<string[]>;
  Duration: number;
  Range: number;
  Icon: string;
  Effects: FluffyEffect[];
  Type: Type;
  Cost?: number[];
}

export interface FluffyEffect {
  Type: PurpleType;
  Condition?: TentacledCondition;
  Block?: number;
  CriticalCheck?: CriticalCheck;
  Hits?: number[];
  DescParamId?: number;
  Scale?: number[];
  IgnoreDef?: number[];
  Target?: Selection[];
  Value?: Array<number[]>;
  Stat?: string;
  Channel?: number;
  Duration?: number;
  Icon?: string;
}

export interface TentacledCondition {
  Type: ConditionType;
  Parameter: string;
  Operand: ConditionOperand;
  Value: boolean;
}

export interface ExtraPassiveRadius {
  Type: RadiusType;
  Width?: number;
  Height?: number;
  Radius?: number;
  Degree?: number;
}

export interface GearPublic {
  Name: string;
  Desc: string;
  Parameters: Array<string[]>;
  Cost?: number[];
  Duration?: number;
  Range?: number;
  Radius?: ExRadius[];
  Icon: string;
  Effects: GearPublicEffect[];
  SortHits?: number;
  ExtraSkills?: GearPublicExtraSkill[];
  Id?: string;
  Type?: Type;
  GroupLabel?: { [key: string]: ExGroupLabel };
  Selectable?: boolean;
}

export interface GearPublicEffect {
  Type: PurpleType;
  Block?: number;
  CriticalCheck?: CriticalCheck;
  Hits?: number[];
  DescParamId?: number;
  Scale?: number[];
  Target?: Selection[] | TargetEnum;
  ApplyFrame?: number;
  Chance?: number;
  Icon?: string;
  MultiplySource?: string;
  MultiplierConstant?: number[];
  Condition?: PurpleCondition;
  Group?: number;
  Duration?: number;
  Period?: number;
  IgnoreDef?: number[];
  Reposition?: Selection[];
  ZoneHitInterval?: number;
  ZoneDuration?: number;
  Critical?: number;
  HideFormChangeIcon?: boolean;
  Frames?: Frames;
  HitFrames?: number[];
  ValueType?: ValueType;
  Uses?: number;
  ApplyStability?: boolean;
  StatModifier?: StatModifier;
  Value?: Array<Array<ValueClass | number>>;
  Stat?: string;
  Channel?: number;
  Key?: string;
  StackLabel?: ExGroupLabel[];
  StackSame?: number;
  Restrictions?: PurpleRestriction[];
  SummonId?: number;
  CasterStat?: FavorStatType;
  OverrideSlot?: OverrideSlot;
  SourceStat?: FavorStatType;
  TargetHpRateModifier?: TargetHPRateModifier;
  ExtraStatSource?: string;
  ExtraStatRate?: number[];
  OverrideSkillType?: Type;
}

export interface GearPublicExtraSkill {
  Id?: string;
  Name: string;
  Desc: string;
  Parameters: Array<string[]>;
  Cost?: number[];
  Duration?: number;
  Icon: string;
  Effects: TentacledEffect[];
  Selection?: Selection;
  Type?: Type;
  Range?: number;
  Radius?: ExtraSkillRadius[];
  TSAId?: number;
  GroupLabel?: { [key: string]: GroupLabel };
}

export interface TentacledEffect {
  Type: PurpleType;
  Block?: number;
  CriticalCheck?: CriticalCheck;
  Hits?: number[];
  DescParamId?: number;
  Scale?: number[];
  Condition?: FluffyCondition;
  IgnoreDef?: number[];
  Target?: Selection[] | TargetEnum;
  Value?: Array<number[]>;
  Stat?: string;
  Channel?: number;
  Duration?: number;
  Icon?: string;
  ApplyFrame?: number;
  Chance?: number;
  MultiplySource?: string;
  MultiplierConstant?: number[];
  Group?: number;
  Period?: number;
  Reposition?: Selection[];
  ZoneHitInterval?: number;
  ZoneDuration?: number;
  Critical?: number;
  HideFormChangeIcon?: boolean;
  Frames?: Frames;
  HitFrames?: number[];
  ValueType?: ValueType;
  Uses?: number;
  ApplyStability?: boolean;
  StatModifier?: StatModifier;
}

export interface Normal {
  Effects: NormalEffect[];
  Frames: Frames;
  FormChange?: FormChange;
  Radius?: ExRadius[];
}

export interface NormalEffect {
  Type: PurpleType;
  Hits?: number[];
  Scale?: number[];
  Block?: number;
  Condition?: PurpleCondition;
  CriticalCheck?: CriticalCheck;
  DescParamId?: number;
  Group?: number;
  IgnoreDef?: number[];
  Target?: TargetEnum;
  Duration?: number;
  Icon?: string;
  ExcludeDesc?: boolean;
  OverrideSkillType?: Type;
  StatModifier?: StatModifier;
  Chance?: number;
  ApplyFrame?: number;
  Period?: number;
  TargetHpRateModifier?: TargetHPRateModifier;
  MultiplySource?: string;
  MultiplierConstant?: number[];
  Reposition?: Selection[];
  ZoneHitInterval?: number;
  ZoneDuration?: number;
  Critical?: number;
  HideFormChangeIcon?: boolean;
  Frames?: Frames;
  HitFrames?: number[];
  ValueType?: ValueType;
  Uses?: number;
  ApplyStability?: boolean;
  SubstituteCondition?: Type;
  SubstituteScale?: number[];
}

export interface FormChange {
  Effects: FormChangeEffect[];
  Frames: Frames;
  Radius?: FormChangeRadius[];
  FixedFrameRate?: number;
}

export interface FormChangeEffect {
  Type: PurpleType;
  Hits?: number[];
  Scale?: number[];
  Block?: number;
  Condition?: StickyCondition;
  CriticalCheck?: CriticalCheck;
  DescParamId?: number;
  Group?: number;
  IgnoreDef?: number[];
  Target?: Selection;
  Duration?: number;
  Icon?: string;
  ExcludeDesc?: boolean;
  OverrideSkillType?: Type;
  StatModifier?: StatModifier;
  Chance?: number;
  ApplyFrame?: number;
  Period?: number;
  TargetHpRateModifier?: TargetHPRateModifier;
}

export interface StickyCondition {
  Type: ConditionType;
  Parameter: string;
  Value: number[] | boolean | ArmorType | number;
  Operand?: ConditionOperand;
}

export interface FormChangeRadius {
  Type: RadiusType;
  Radius: number;
  Degree?: number;
  ExcludeRadius?: number;
}

export interface Passive {
  Name: string;
  Desc: string;
  Parameters: Array<string[]>;
  Icon: string;
  Effects: PassiveEffect[];
  Cost?: number[];
  Duration?: number;
  Range?: number;
  Radius?: ExtraPassiveRadius[];
  GroupLabel?: { [key: string]: ExtraPassiveGroupLabel };
  ExtraSkills?: ExtraPassiveExtraSkill[];
  Id?: string;
  Type?: Type;
}

export interface PassiveEffect {
  Type: PurpleType;
  Target?: Selection[] | TargetEnum;
  Value?: Array<Array<ValueClass | number>>;
  Stat?: string;
  Channel?: number;
  Duration?: number;
  ApplyFrame?: number;
  Key?: string;
  Reposition?: Selection[];
  StackLabel?: ExGroupLabel[];
  Scale?: number[];
  StackSame?: number;
  Icon?: string;
  Chance?: number;
  Restrictions?: PurpleRestriction[];
  SummonId?: number;
  CasterStat?: FavorStatType;
  Period?: number;
  OverrideSlot?: OverrideSlot;
  ValueType?: ValueType;
  Uses?: number;
  Block?: number;
  CriticalCheck?: CriticalCheck;
  Hits?: number[];
  DescParamId?: number;
  Group?: number;
  Critical?: number;
  Condition?: FluffyCondition;
  HideFormChangeIcon?: boolean;
  Frames?: Frames;
  SourceStat?: FavorStatType;
  TargetHpRateModifier?: TargetHPRateModifier;
  HitFrames?: number[];
  IgnoreDef?: number[];
  ExtraStatSource?: string;
  ExtraStatRate?: number[];
  OverrideSkillType?: Type;
  StatModifier?: StatModifier;
}

export interface Public {
  Name: string;
  Desc: string;
  Parameters: Array<string[]>;
  Cost?: number[];
  Duration?: number;
  Range?: number;
  Radius?: ExRadius[];
  Icon: string;
  Effects: GearPublicEffect[];
  SortHits?: number;
  ExtraSkills?: GearPublicExtraSkill[];
  GroupLabel?: { [key: string]: ExGroupLabel };
  Id?: string;
  Type?: Type;
  Selectable?: boolean;
  Selection?: Selection;
  TSAId?: number;
}

export type SquadType = 'Main' | 'Support';

export interface Summon {
  Id: number;
  SourceSkill: Type;
  ObstacleMaxHP1?: number;
  ObstacleMaxHP100?: number;
  ObstacleSize?: number[];
}

export type TacticRole =
  | 'DamageDealer'
  | 'Tanker'
  | 'Supporter'
  | 'Healer'
  | 'Vehicle';

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

export type WeaponType =
  | 'SR'
  | 'SG'
  | 'AR'
  | 'MG'
  | 'SMG'
  | 'RG'
  | 'HG'
  | 'GL'
  | 'RL'
  | 'FT'
  | 'MT';
