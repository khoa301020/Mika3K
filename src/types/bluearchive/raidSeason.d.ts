export interface IRaidSeason {
  Seasons: Season[];
  EliminateSeasons: Season[];
  RewardSets: { [key: string]: Array<Array<Array<number[]> | number>> };
  EliminateRewardSets: { [key: string]: Array<Array<Array<number[]> | number>> };
}

export interface Season {
  RegionId?: number; // custom property
  SeasonId: number;
  SeasonDisplay: number | string;
  ArmorTypes?: ArmorType[];
  TormentArmorType?: ArmorType;
  RaidId: number;
  Terrain: Terrain;
  Start: number;
  End: number;
  RewardSet: number;
  RewardSetMax: number;
}

export type ArmorType = 'LightArmor' | 'HeavyArmor' | 'Unarmed';

export type Terrain = 'Street' | 'Outdoor' | 'Indoor';
