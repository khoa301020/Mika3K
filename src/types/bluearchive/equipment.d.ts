export interface IEquipment {
  Id: number;
  Category: string;
  Rarity: Rarity;
  Tier: number;
  Icon: string;
  Shops: Shop[];
  Name: string;
  Desc: string;
  IsReleased: boolean[];
  StatType: StatType[];
  StatValue: Array<number[]>;
  Recipe?: Array<number[]>;
  RecipeCost?: number;
}

export type Rarity = 'N' | 'R' | 'SR' | 'SSR';

export interface Shop {
  ShopCategory: ShopCategory;
  Released: boolean[];
  Amount: number;
  CostType: CostType;
  CostId: number;
  CostAmount: number;
}

export type CostType = 'Currency' | 'Item';

export type ShopCategory = 'General' | 'SecretStoneGrowth' | 'MasterCoin';

export type StatType =
  | 'AttackPower_Base'
  | 'AttackPower_Coefficient'
  | 'CriticalDamageRate_Base'
  | 'CriticalPoint_Base'
  | 'AccuracyPoint_Base'
  | 'MaxHP_Coefficient'
  | 'MaxHP_Base'
  | 'DefensePower_Base'
  | 'HealEffectivenessRate_Base'
  | 'DodgePoint_Base'
  | 'OppressionResist_Coefficient'
  | 'CriticalChanceResistPoint_Base'
  | 'CriticalDamageResistRate_Base'
  | 'HealPower_Coefficient'
  | 'OppressionPower_Coefficient';
