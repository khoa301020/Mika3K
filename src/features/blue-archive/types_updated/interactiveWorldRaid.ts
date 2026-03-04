export interface IInteractiveWorldRaid {
  Id: number;
  IsReleased: boolean[];
  Name: string;
  MaxDifficulty: number[];
  DifficultyName: DifficultyName[];
  DevName: string;
  PathName: string;
  EventId: number;
  Icon: string;
  IconBG: IconBG;
  EchelonExtensionType: EchelonExtensionType;
  BulletType: BulletType[];
  ArmorType: ArmorType[];
  Level: number[];
  Terrain: Terrain[];
  EntryCost: Array<number[]>;
  BattleDuration: number[];
  EnemyList: Array<number[]>;
  RaidSkillList: Array<string[]>;
  Rewards: Array<Reward[]>;
  GlobalSkillList?: string[];
}

export type ArmorType =
  | 'HeavyArmor'
  | 'ElasticArmor'
  | 'LightArmor'
  | 'Unarmed'
  | 'Normal';

export type BulletType = 'Normal' | 'Explosion' | 'Mystic' | 'Pierce';

export type DifficultyName = 'A' | 'B' | 'C' | 'D';

export type EchelonExtensionType = 'Base' | 'Extension';

export type IconBG =
  | 'WorldRaid854_Bg_BattleStage_P1'
  | 'WorldRaid854_Bg_BattleStage_P2'
  | 'WorldRaid854_Bg_BattleStage_P3';

export interface Reward {
  Type: Type;
  Id: number;
  Amount?: number;
  Chance?: number;
}

export type Type = 'Item' | 'Currency' | 'Equipment' | 'GachaGroup';

export type Terrain = 'Outdoor' | 'Indoor' | 'Street';
