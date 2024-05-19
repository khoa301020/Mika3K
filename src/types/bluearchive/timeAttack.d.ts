export interface ITimeAttack {
  Id: number;
  IsReleased: boolean[];
  DungeonType: DungeonType;
  Icon: Icon;
  MaxDifficulty: number;
  Terrain: Terrain;
  BulletType: BulletType;
  ArmorType: ArmorType;
  EnemyLevel: number[];
  Formations: Formation[];
  Rules: Array<Rule[] | ITimeAttackRule[]>;
  BattleDuration: number[];
}

export type ArmorType = 'LightArmor' | 'Unarmed' | 'HeavyArmor' | 'ElasticArmor';

export type BulletType = 'Normal';

export type DungeonType = 'Shooting' | 'Defense' | 'Destruction' | 'Escort';

export interface Formation {
  Id: number;
  Level: number[];
  Grade: number[];
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

/* TIME ATTACK RULE */

export interface ITimeAttackRule {
  Id: number;
  Icon: string;
  Name: string;
  Desc: string;
}
