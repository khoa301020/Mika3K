export interface IEnemy {
  Id: number;
  DevName: string;
  Name: string;
  SquadType: SquadType;
  Rank: Rank;
  BulletType: BulletType;
  ArmorType: ArmorType;
  WeaponType: WeaponType;
  Size: Size | null;
  Icon?: string;
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
  CriticalResistPoint: number;
  CriticalDamageResistRate: number;
  Range: number;
  DamagedRatio: number;
  Transcendence?: Array<number[]>;
  Skills?: string[];
  StreetBattleAdaptation?: number;
  IndoorBattleAdaptation?: number;
  OutdoorBattleAdaptation?: number;
  GroggyGauge?: number;
  GroggyTime?: number;
  PhaseChange?: PhaseChange[];
  OppressionPower?: number;
  OppressionResist?: number;
  DefensePenetration1?: number;
  DefensePenetration100?: number;
  IsNPC?: boolean;
}

export type ArmorType = 'LightArmor' | 'HeavyArmor' | 'Unarmed' | 'ElasticArmor' | 'Normal';

export type BulletType = 'Normal' | 'Explosion' | 'Mystic' | 'Pierce' | 'Sonic';

export interface PhaseChange {
  Phase: number;
  Trigger: Trigger;
  Argument: number;
}

export type Trigger = 'HPUnder';

export type Rank = 'Minion' | 'Elite' | 'Champion' | 'Boss' | 'Summoned' | 'Hallucination' | 'DestructibleProjectile';

export type Size = 'Medium' | 'Small' | 'Large' | 'XLarge';

export type SquadType = 'Main' | 'Support';

export type WeaponType =
  | 'SMG'
  | 'MG'
  | 'SR'
  | 'SG'
  | 'AR'
  | 'RL'
  | 'HG'
  | 'GL'
  | 'None'
  | 'Vulcan'
  | 'Missile'
  | 'Cannon'
  | 'FT'
  | 'MT'
  | 'RG'
  | 'Taser'
  | 'Binah'
  | 'Relic';
