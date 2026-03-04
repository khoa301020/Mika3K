export interface IRaid {
  Id: number;
  IsReleased: boolean[];
  MaxDifficulty: number[];
  PathName: string;
  Terrain: Terrain[];
  BulletType: BulletType;
  BulletTypeInsane: BulletTypeInsane;
  ArmorType: string;
  EnemyList: Array<number[]>;
  RaidSkillList: Array<string[]>;
  BattleDuration: number[];
  Name: string;
  DevName: string;
  EnemyExtraStats?: { [key: string]: EnemyExtraStat[] };
}

export type BulletType = 'Normal';

export type BulletTypeInsane = 'Pierce' | 'Explosion' | 'Mystic';

export interface EnemyExtraStat {
  Stat: Stat;
  Amount: number;
  Difficulty?: number[];
  LabelStacks?: number;
}

export type Stat = 'MaxHP_Base' | 'MaxHP_Coefficient';

export type Terrain = 'Outdoor' | 'Street' | 'Indoor';
