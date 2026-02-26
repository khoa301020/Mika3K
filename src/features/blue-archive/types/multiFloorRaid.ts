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
  RaidSkill: RaidSkill[];
  HasNormalAttack: any[];
  Name: string;
  BattleDuration: number;
  RaidFloors: RaidFloor[];
}

export type BulletType = 'Normal' | 'Explosion';

export interface RaidFloor {
  Level: number;
  StatChange: { [key: string]: StatChange };
}

export interface StatChange {
  AttackPower_Coefficient?: number;
  MaxHP_Coefficient?: number;
  AttackPower_Base?: number;
  MaxHP_Base?: number;
}

export interface RaidSkill {
  Id: string;
  SkillType: SkillType;
  ATGCost: number;
  Icon: string;
  Name: string;
  Desc: string;
  Parameters?: Array<string[]>;
  MinDifficulty?: number;
  MaxDifficulty?: number;
}

export type SkillType = 'EX' | 'Public' | 'Passive';
