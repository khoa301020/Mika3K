////////////////////////////////////////////////////////////////////////////////
////////////////////////////////   IEquipment   ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

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
  StatType: string[];
  StatValue: Array<number[]>;
  Recipe?: Array<number[]>;
  RecipeCost?: number;
}

export type Rarity = 'N';

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
