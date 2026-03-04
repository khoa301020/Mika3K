export interface IFurniture {
  Id: number;
  IsReleased: boolean[];
  Rarity: Rarity;
  Icon: string;
  Craftable: boolean[];
  ComfortBonus: number;
  Category: Category;
  Size: number[];
  Tags: string[];
  ShiftingCraftQuality?: number;
  CraftQuality: number;
  SubCategory: SubCategory;
  SetGroupId: number;
  Name: string;
  Desc: string;
  Interaction: boolean[];
  Templates?: Array<number[]>;
  ShiftingCraftRecipe?: ShiftingCraftRecipe;
}

export type Category = 'Interiors' | 'Decorations' | 'Furnitures';

export type Rarity = 'N' | 'R' | 'SR' | 'SSR';

export interface ShiftingCraftRecipe {
  Released: boolean[];
  RequireItem: number[];
  RequireGold: number;
  IngredientTag: string[];
  IngredientExp: number;
}

export type SubCategory =
  | 'Floor'
  | 'Wallpaper'
  | 'Background'
  | 'WallDecoration'
  | 'Closet'
  | 'FloorDecoration'
  | 'Chair'
  | 'Table'
  | 'Prop'
  | 'HomeAppliance'
  | 'Bed'
  | 'Trophy'
  | 'FurnitureEtc';
