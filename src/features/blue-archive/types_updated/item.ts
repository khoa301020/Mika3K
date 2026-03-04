export interface IItem {
  Id: number;
  IsReleased: boolean[];
  Category: Category;
  Rarity: Rarity;
  Quality: number;
  Tags: string[];
  CraftQuality?: number;
  Craftable: boolean[];
  StageDrop: boolean[];
  Shop: boolean[];
  Icon: string;
  Name: string;
  Desc: string;
  ExpValue?: number;
  ShiftingCraftQuality?: number;
  SubCategory?: SubCategory;
  EventId?: number;
  EventBonus?: EventBonus;
  ShiftingCraftRecipe?: ShiftingCraftRecipe;
  EventBonusRerun?: EventBonusRerun;
  ConsumeType?: ConsumeType;
  GachaGroupId?: number;
  Items?: Item[];
  ItemsCn?: Item[];
  ItemsGlobal?: Item[];
  ShiftingCraftQualityGlobal?: number;
  ShiftingCraftQualityCn?: number;
}

export type Category =
  | 'Material'
  | 'Coin'
  | 'CharacterExpGrowth'
  | 'Favor'
  | 'SecretStone'
  | 'Collectible'
  | 'Consumable';

export type ConsumeType = 'Random' | 'Choice';

export interface EventBonus {
  Jp?: Array<number[]>;
  Global?: Array<number[]>;
  Cn?: Array<number[]>;
}

export interface EventBonusRerun {
  Jp?: Array<number[]>;
}

export interface Item {
  Type: Type;
  Id: number;
  AmountMin: number;
  AmountMax: number;
}

export type Type = 'Item' | 'Equipment' | 'Furniture';

export type Rarity = 'N' | 'R' | 'SR' | 'SSR';

export interface ShiftingCraftRecipe {
  Released: boolean[];
  RequireItem: number[];
  RequireGold: number;
  IngredientTag: string[];
  IngredientExp: number;
}

export type SubCategory = 'Artifact' | 'CDItem' | 'BookItem';
