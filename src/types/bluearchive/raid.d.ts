////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////   IRaid   ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export interface IRaid {
  Raid: Raid[];
  RaidSeasons: RaidSeason[];
  TimeAttack: TimeAttack[];
  TimeAttackRules: TimeAttackRule[];
  WorldRaid: WorldRaid[];
}

export interface Raid {
  Id: number;
  IsReleased: boolean[];
  MaxDifficulty: number[];
  PathName: string;
  Faction: string;
  Terrain: Terrain[];
  BulletType: Type;
  BulletTypeInsane: string;
  ArmorType: Type;
  EnemyList: Array<number[]>;
  RaidSkill: RaidSkill[];
  Name: string;
  Profile: string;
  Icon?: string;
  IconBG?: string;
}

export type Type = 'LightArmor' | 'Unarmed' | 'HeavyArmor' | 'Normal';

export interface RaidSkill {
  Id: string;
  SkillType: SkillType;
  MinDifficulty?: number;
  ATGCost: number;
  Icon: string;
  Name: string;
  Desc: string;
  Parameters?: Array<string[]>;
  Effects?: Effect[];
}

export interface Effect {
  Type: TypeEnum;
  Value: Array<number[]>;
  Stat: string;
  Channel: number;
  RestrictTo?: number[];
  StackSame?: number;
}

export type TypeEnum = 'BuffAlly' | 'BuffTarget';

export type SkillType = 'EX' | 'Passive';

export type Terrain = 'Outdoor' | 'Street' | 'Indoor';

export interface RaidSeason {
  Seasons: Season[];
  RewardSets: { [key: string]: Array<RewardSet[]> };
}

export type RewardSet = Array<number[]> | number;

export interface Season {
  Season: number;
  RaidId: number;
  Terrain: Terrain;
  Start: number;
  End: number;
  RewardSet: number;
  RewardSetMax: number;
}

export interface TimeAttack {
  Id: number;
  IsReleased: boolean[];
  DungeonType: DungeonType;
  Icon: Icon;
  MaxDifficulty: number;
  Terrain: Terrain;
  BulletType: Type;
  ArmorType: Type;
  EnemyLevel: number[];
  Formations: Formation[];
  Rules: Array<number[]>;
}

export type DungeonType = 'Shooting' | 'Defense' | 'Destruction';

export interface Formation {
  Id: number;
  Level: number[];
  Grade: number[];
  EnemyList: number[];
}

export type Icon =
  | 'EnemyInfo_Boxcat_Terror'
  | 'EnemyInfo_Sweeper_Decagram_Taser_White'
  | 'EnemyInfo_Totem03_TimeAttack';

export interface TimeAttackRule {
  Id: number;
  Icon: string;
  Name: string;
  Desc: string;
}

export interface WorldRaid {
  Id: number;
  IsReleased: boolean[];
  DifficultyMax: number[];
  PathName: string;
  IconBG: string;
  Terrain: Terrain[];
  BulletType: Type;
  ArmorType: Type;
  WorldBossHP?: number;
  Level: number[];
  EnemyList: Array<number[]>;
  RaidSkill: RaidSkill[];
  Name: string;
  Rewards: Reward[];
  EntryCost: Array<number[]>;
  RewardsGlobal?: Reward[];
  BulletTypeInsane?: string;
  UseRaidSkillList?: number;
}

export interface Reward {
  Items: Array<number[]>;
  Groups: Array<Group[]>;
}

export type Group = Array<number[]> | number;
