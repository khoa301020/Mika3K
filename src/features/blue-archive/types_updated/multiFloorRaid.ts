export interface IMultiFloorRaid {
  Id: number;
  IsReleased: boolean[];
  MaxDifficulty: number[];
  DifficultyStartFloor: number[];
  PathName: string;
  Terrain: string[];
  BulletType: BulletType[];
  ArmorType: string;
  EnemyList: Array<number[]>;
  RaidSkillList: Array<string[]>;
  Name: string;
  BattleDuration: number;
  RaidFloors: RaidFloor[];
  DevName: string;
}

export type BulletType = 'Normal' | 'Explosion' | 'Mystic' | 'Pierce';

export interface RaidFloor {
  Level: number;
  StatChange: { [key: string]: StatChange };
}

export interface StatChange {
  AttackPower_Coefficient?: number;
  MaxHP_Coefficient?: number;
  AttackPower_Base?: number;
  MaxHP_Base?: number;
  HealPower_Coefficient?: number;
  HealPower_Base?: number;
}
