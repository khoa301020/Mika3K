export interface ICurrency {
  Id: number;
  Category: string;
  Rarity: Rarity;
  Icon: string;
  Name: string;
  Desc: string;
}

export type Rarity = 'N';
