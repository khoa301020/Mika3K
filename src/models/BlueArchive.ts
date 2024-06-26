import mongoose from 'mongoose';
import init from '../cron/index.js';
import { cache } from '../main.js';
import { ICurrency } from '../types/bluearchive/currency';
import { IEnemy, PhaseChange } from '../types/bluearchive/enemy';
import { Shop as EquipmentShop, IEquipment } from '../types/bluearchive/equipment';
import { IFurniture } from '../types/bluearchive/furniture';
import { IItem, Shop as ItemShop } from '../types/bluearchive/item';
import { ILocalization } from '../types/bluearchive/localization';
import { IMultiFloorRaid, RaidSkill as MultiFloorRaidSkill, RaidFloor } from '../types/bluearchive/multiFloorRaid.js';
import { IRaid, RaidSkill, Terrain } from '../types/bluearchive/raid';
import { Season } from '../types/bluearchive/raidSeason.js';
import { IStudent, Skill, Summon } from '../types/bluearchive/student';
import { ISummon } from '../types/bluearchive/summon';
import { Formation, ITimeAttack, Rule } from '../types/bluearchive/timeAttack.js';
import { IWorldRaid, Reward as WorldRaidReward } from '../types/bluearchive/worldRaid.js';
import { isObjectEmpty } from '../utils/index.js';

const StudentSchema = new mongoose.Schema<IStudent>(
  {
    Id: Number,
    IsReleased: Array<Boolean>,
    DefaultOrder: Number,
    PathName: String,
    DevName: String,
    Name: String,
    School: String,
    Club: String,
    StarGrade: Number,
    SquadType: String,
    TacticRole: String,
    Summons: Array<Summon>,
    Position: String,
    BulletType: String,
    ArmorType: String,
    StreetBattleAdaptation: Number,
    OutdoorBattleAdaptation: Number,
    IndoorBattleAdaptation: Number,
    WeaponType: String,
    WeaponImg: String,
    Cover: Boolean,
    Equipment: Array<String>,
    CollectionBG: String,
    FamilyName: String,
    PersonalName: String,
    SchoolYear: String,
    CharacterAge: String,
    Birthday: String,
    CharacterSSRNew: String,
    ProfileIntroduction: String,
    Hobby: String,
    CharacterVoice: String,
    BirthDay: String,
    Illustrator: String,
    Designer: String,
    CharHeightMetric: String,
    CharHeightImperial: String,
    StabilityPoint: Number,
    AttackPower1: Number,
    AttackPower100: Number,
    MaxHP1: Number,
    MaxHP100: Number,
    DefensePower1: Number,
    DefensePower100: Number,
    HealPower1: Number,
    HealPower100: Number,
    DodgePoint: Number,
    AccuracyPoint: Number,
    CriticalPoint: Number,
    CriticalDamageRate: Number,
    AmmoCount: Number,
    AmmoCost: Number,
    Range: Number,
    RegenCost: Number,
    Skills: Array<Skill>,
    FavorStatType: Array<String>,
    FavorStatValue: Array<Number[]>,
    FavorAlts: Array<Number>,
    MemoryLobby: Array<Number>,
    MemoryLobbyBGM: String,
    FurnitureInteraction: Array<Array<Number[]>>,
    FavorItemTags: Array<String>,
    FavorItemUniqueTags: Array<String>,
    IsLimited: Number,
    Weapon: mongoose.Schema.Types.Mixed,
    Gear: mongoose.Schema.Types.Mixed,
    SkillExMaterial: Array<Number[]>,
    SkillExMaterialAmount: Array<Number[]>,
    SkillMaterial: Array<Number[]>,
    SkillMaterialAmount: Array<Number[]>,
    TSAId: Number,
    DefensePenetration1: Number,
    DefensePenetration100: Number,
  },
  {
    strict: false,
  },
);
const CurrencySchema = new mongoose.Schema<ICurrency>(
  {
    Id: Number,
    Category: String,
    Rarity: String,
    Icon: String,
    Name: String,
    Desc: String,
  },
  { strict: false },
);
const EnemySchema = new mongoose.Schema<IEnemy>(
  {
    Id: Number,
    DevName: String,
    Name: String,
    SquadType: String,
    Rank: String,
    BulletType: String,
    ArmorType: String,
    WeaponType: String,
    Size: String,
    Icon: String,
    StabilityPoint: Number,
    StabilityRate: Number,
    AttackPower1: Number,
    AttackPower100: Number,
    MaxHP1: Number,
    MaxHP100: Number,
    DefensePower1: Number,
    DefensePower100: Number,
    HealPower1: Number,
    HealPower100: Number,
    DodgePoint: Number,
    AccuracyPoint: Number,
    CriticalPoint: Number,
    CriticalDamageRate: Number,
    CriticalResistPoint: Number,
    CriticalDamageResistRate: Number,
    Range: Number,
    DamagedRatio: Number,
    Transcendence: Array<Number[]>,
    Skills: Array<Number>,
    StreetBattleAdaptation: Number,
    IndoorBattleAdaptation: Number,
    OutdoorBattleAdaptation: Number,
    GroggyGauge: Number,
    GroggyTime: Number,
    PhaseChange: Array<PhaseChange>,
    OppressionPower: Number,
    OppressionResist: Number,
    DefensePenetration1: Number,
    DefensePenetration100: Number,
    IsNPC: Boolean,
  },
  { strict: false },
);
const EquipmentSchema = new mongoose.Schema<IEquipment>(
  {
    Id: Number,
    Category: String,
    Rarity: String,
    Tier: Number,
    Icon: String,
    Shops: Array<EquipmentShop>,
    Name: String,
    Desc: String,
    IsReleased: Array<Boolean>,
    StatType: Array<String>,
    StatValue: Array<Number[]>,
    Recipe: Array<Number[]>,
    RecipeCost: Number,
  },
  { strict: false },
);
const FurnitureSchema = new mongoose.Schema<IFurniture>(
  {
    Id: Number,
    IsReleased: Array<Boolean>,
    Rarity: String,
    Icon: String,
    ComfortBonus: String,
    Category: String,
    Tags: Array<String>,
    ShiftingCraftQuality: Number,
    ShiftingCraftQualityCn: Number,
    ShiftingCraftQualityGlobal: Number,
    SubCategory: String,
    SetGroupId: Number,
    Name: String,
    Desc: String,
    Interaction: Array<Boolean>,
  },
  { strict: false },
);
const ItemSchema = new mongoose.Schema<IItem>(
  {
    Id: Number,
    IsReleased: Array<Boolean>,
    Category: String,
    Rarity: String,
    Quality: Number,
    Tags: Array<String>,
    Shops: Array<ItemShop>,
    Craftable: Array<Boolean>,
    StageDrop: Array<Boolean>,
    Icon: String,
    Name: String,
    Desc: String,
    ExpValue: Number,
    ShiftingCraftQuality: Number,
    EventBonus: Array<Number[]>,
    ConsumeType: String,
    ImmediateUse: Boolean,
    Contains: Array<Number[]>,
    ContainsCn: Array<Number[]>,
    ExpiryTime: Array<Number | null>,
    EventBonusGlobal: Array<Number[]>,
    EventBonusCn: Array<Number[]>,
    ContainsGlobal: Array<Number[]>,
  },
  { strict: false },
);
const RaidSchema = new mongoose.Schema<IRaid>(
  {
    Id: Number,
    IsReleased: Array<Boolean>,
    MaxDifficulty: Array<Number>,
    PathName: String,
    GroupName: String,
    Faction: String,
    Terrain: Array<Terrain>,
    BulletType: String,
    BulletTypeInsane: String,
    ArmorType: String,
    EnemyList: Array<Number[]>,
    RaidSkill: Array<RaidSkill>,
    HasNormalAttack: Array<Number>,
    BattleDuration: Array<Number>,
    Name: String,
    Profile: String,
    Icon: String,
    IconBG: String,
  },
  { strict: false },
);
const RaidSeasonSchema = new mongoose.Schema<Season>(
  {
    SeasonId: Number,
    SeasonDisplay: Number || String,
    ArmorTypes: Array<String>,
    TormentArmorType: String,
    RaidId: Number,
    Terrain: String,
    Start: Number,
    End: Number,
    RewardSet: Number,
    RewardSetMax: Number,
  },
  { strict: false },
);

const TimeAttackSchema = new mongoose.Schema<ITimeAttack>(
  {
    Id: Number,
    IsReleased: Array<Boolean>,
    DungeonType: String,
    Icon: String,
    MaxDifficulty: Number,
    Terrain: String,
    BulletType: String,
    ArmorType: String,
    EnemyLevel: Array<Number>,
    Formations: Array<Formation>,
    Rules: Array<Rule[]>,
    BattleDuration: Array<Number>,
  },
  { strict: false },
);

const WorldRaidSchema = new mongoose.Schema<IWorldRaid>(
  {
    Id: Number,
    IsReleased: Array<Boolean>,
    MaxDifficulty: Array<Number>,
    DifficultyName: Array<String>,
    PathName: String,
    IconBG: String,
    Terrain: Array<String>,
    BulletType: String,
    ArmorType: String,
    WorldBossHP: Number,
    Level: Array<Number>,
    EnemyList: Array<Number[]>,
    RaidSkill: Array<RaidSkill>,
    HasNormalAttack: Array<any>,
    Name: String,
    Rewards: Array<WorldRaidReward>,
    RewardsRerun: Array<WorldRaidReward>,
    EntryCost: Array<Number[]>,
    BattleDuration: Array<Number>,
    RewardsGlobal: Array<WorldRaidReward>,
    RewardsRerunGlobal: Array<WorldRaidReward>,
    BulletTypeInsane: String,
    UseRaidSkillList: Number,
  },
  { strict: false },
);

const MultiFloorRaidSchema = new mongoose.Schema<IMultiFloorRaid>(
  {
    Id: Number,
    IsReleased: Array<Boolean>,
    MaxDifficulty: Array<Number>,
    DifficultyStartFloor: Array<Number>,
    PathName: String,
    Terrain: Array<String>,
    BulletType: Array<String>,
    ArmorType: String,
    EnemyList: Array<Number[]>,
    RaidSkill: Array<MultiFloorRaidSkill>,
    HasNormalAttack: Array<any>,
    Name: String,
    BattleDuration: Number,
    RaidFloors: Array<RaidFloor>,
  },
  { strict: false },
);

const SummonSchema = new mongoose.Schema<ISummon>(
  {
    Id: Number,
    Skills: Array<Skill>,
    Name: String,
    DevName: String,
    Type: String,
    BulletType: String,
    ArmorType: String,
    StreetBattleAdaptation: Number,
    OutdoorBattleAdaptation: Number,
    IndoorBattleAdaptation: Number,
    WeaponType: String,
    StabilityPoint: Number,
    StabilityRate: Number,
    AttackPower1: Number,
    AttackPower100: Number,
    MaxHP1: Number,
    MaxHP100: Number,
    DefensePower1: Number,
    DefensePower100: Number,
    HealPower1: Number,
    HealPower100: Number,
    DodgePoint: Number,
    AccuracyPoint: Number,
    CriticalPoint: Number,
    CriticalDamageRate: Number,
    AmmoCount: Number,
    AmmoCost: Number,
    Range: Number,
    MoveSpeed: Number,
    RegenCost: Number,
    TacticRole: mongoose.Schema.Types.Mixed,
    StarBonus: Boolean,
  },
  { strict: false },
);

function transformStudent(localization: ILocalization | undefined, doc: any) {
  doc.SchoolLong = localization ? localization.SchoolLong[doc.School] : doc.School;
  doc.Club = localization ? localization.Club[doc.Club] : doc.Club;
  doc.SquadType = localization ? localization.SquadType[doc.SquadType] : doc.SquadType;
  doc.TacticRoleLong = localization ? localization.TacticRole[doc.TacticRole] : doc.TacticRole;
  doc.ArmorType = localization ? localization.ArmorTypeLong[doc.ArmorType] : doc.ArmorType;
}
StudentSchema.post('find', function (res) {
  const localization: ILocalization | undefined = cache.get('BA_Localization');
  if (res.length === 0) return;
  res.forEach((res: any) => transformStudent(localization, res));
});

RaidSchema.post('findOne', async function (res: IRaid, next) {
  if (isObjectEmpty(res)) return;
  res.BossList = [];
  let promises: Array<Promise<any>> = [];
  res.EnemyList.forEach((enemies: Array<number>, index: number) =>
    promises.push(
      SchaleDB.Enemy.find({ Id: { $in: enemies }, Rank: 'Boss' }).then((bosses) => (res.BossList![index] = bosses)),
    ),
  );
  await Promise.all(promises);
  next();
});

init();
const conn = mongoose.createConnection(process.env.MONGO_URI_BA!);

export const SchaleDB = {
  Student: conn.model<IStudent>('Student', StudentSchema, 'Students'),
  Currency: conn.model<ICurrency>('Currency', CurrencySchema, 'Currencies'),
  Enemy: conn.model<IEnemy>('Enemy', EnemySchema, 'Enemies'),
  Equipment: conn.model<IEquipment>('Equipment', EquipmentSchema, 'Equipments'),
  Furniture: conn.model<IFurniture>('Furniture', FurnitureSchema, 'Furnitures'),
  Item: conn.model<IItem>('Item', ItemSchema, 'Items'),
  Raid: conn.model<IRaid>('Raid', RaidSchema, 'Raids'),
  RaidSeason: conn.model<Season>('RaidSeason', RaidSeasonSchema, 'RaidSeasons'),
  TimeAttack: conn.model<ITimeAttack>('TimeAttack', TimeAttackSchema, 'TimeAttacks'),
  WorldRaid: conn.model<IWorldRaid>('WorldRaid', WorldRaidSchema, 'WorldRaids'),
  MultiFloorRaid: conn.model<IMultiFloorRaid>('MultiFloorRaid', MultiFloorRaidSchema, 'MultiFloorRaids'),
  Summon: conn.model<ISummon>('Summon', SummonSchema, 'Summons'),
};
