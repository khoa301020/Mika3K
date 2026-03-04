export interface IRaidSeason {
  Seasons: Season[];
  EliminateSeasons: Season[];
  RewardSets: {
    [key: string]: Array<
      Array<Array<Array<EliminateRewardSetEnum | number>> | number>
    >;
  };
  EliminateRewardSets: {
    [key: string]: Array<
      Array<Array<Array<EliminateRewardSetEnum | number>> | number>
    >;
  };
}

export type EliminateRewardSetEnum = 'Equipment' | 'Item' | 'Currency';

export interface Season {
  SeasonId: number;
  SeasonDisplay: number | string;
  OpenDifficulty?: OpenDifficulty;
  RaidId: number;
  Terrain: Terrain;
  Start: number;
  End: number;
  RewardSet: number;
  RewardSetMax: number;
}

export interface OpenDifficulty {
  LightArmor?: number;
  HeavyArmor?: number;
  Unarmed?: number;
  ElasticArmor?: number;
}

export type Terrain = 'Street' | 'Outdoor' | 'Indoor';
