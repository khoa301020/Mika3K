export interface IEnemy {
  Id: number;
  DevName: string;
  Name: string;
  SquadType: SquadType;
  Rank: Rank;
  BulletType: BulletType;
  ArmorType: ArmorType;
  WeaponType: WeaponType;
  Tags: string[];
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
  StreetBattleAdaptation?: number;
  IndoorBattleAdaptation?: number;
  GroggyGauge?: number;
  GroggyTime?: number;
  OutdoorBattleAdaptation?: number;
  Skills?: string[];
  OppressionPower?: number;
  OppressionResist?: number;
  DefensePenetration1?: number;
  DefensePenetration100?: number;
}

export type ArmorType = 'LightArmor' | 'HeavyArmor' | 'Unarmed' | 'Normal';

export type BulletType = 'Normal' | 'Explosion' | 'Mystic' | 'Pierce';

export type Rank = 'Minion' | 'Elite' | 'Champion' | 'Boss' | 'Summoned' | 'Hallucination' | 'DestructibleProjectile';

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
  | 'Taser'
  | 'Binah'
  | 'Relic'
  | 'RG'
  | 'MT';
