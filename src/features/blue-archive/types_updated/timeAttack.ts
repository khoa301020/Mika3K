export interface ITimeAttack {
  Id: number;
  IsReleased: boolean[];
  DungeonType: DungeonType;
  Icon: Icon;
  MaxDifficulty: number[];
  Terrain: Terrain;
  BulletType: BulletType;
  ArmorType: ArmorType;
  Level: number[];
  Formations: Formation[];
  Rules: Array<Rule[]>;
  BattleDuration: number[];
  EnemyExtraStats?: { [key: string]: EnemyExtraStat[] };
}

export type ArmorType =
  | 'LightArmor'
  | 'Unarmed'
  | 'HeavyArmor'
  | 'ElasticArmor';

export type BulletType = 'Normal';

export type DungeonType = 'Shooting' | 'Defense' | 'Destruction' | 'Escort';

export interface EnemyExtraStat {
  Stat: Stat;
  Amount: number;
}

export type Stat = 'MaxHP_Base' | 'DefensePower_Base' | 'DodgePoint_Base';

export interface Formation {
  Id: number;
  LevelMinion: number;
  GradeMinion: number;
  EnemyList: number[];
}

export type Icon =
  | 'enemyinfo_boxcat_terror'
  | 'enemyinfo_sweeper_decagram_taser_white'
  | 'enemyinfo_totem03_timeattack'
  | 'enemyinfo_avantgardekun_millenium_ar';

export interface Rule {
  Id: number;
  Parameters?: Array<string[]>;
}

export type Terrain = 'Outdoor' | 'Indoor' | 'Street';
