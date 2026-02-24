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
  ShiftingCraftQualityCn?: number;
  SubCategory: SubCategory;
  SetGroupId: number;
  Name: string;
  Desc: string;
  Interaction: boolean[];
  Templates?: Array<number[]>;
  ShiftingCraftQualityGlobal?: number;
}

export type Category = 'Interiors' | 'Decorations' | 'Furnitures';

export type Rarity = 'N' | 'R' | 'SSR' | 'SR';

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
  | 'FurnitureEtc';
