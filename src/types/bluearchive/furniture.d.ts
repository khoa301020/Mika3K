export interface IFurniture {
  Id: number;
  IsReleased: boolean[];
  Rarity: Rarity;
  Icon: string;
  ComfortBonus: number;
  Category: Category;
  Tags: string[];
  SynthQuality?: number[];
  SubCategory: SubCategory;
  SetGroupId: number;
  Name: string;
  Desc: string;
  Interaction: boolean[];
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
