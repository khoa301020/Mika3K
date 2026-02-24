import axios from 'axios';
import { decode } from 'html-entities';
import { FilterQuery } from 'mongoose';
import { BlueArchiveConstants, CommonConstants } from '../constants/index.js';
import { cache } from '../main.js';
import { SchaleDB } from '../models/BlueArchive.js';
import { ICurrency } from '../types/bluearchive/currency';
import { IEnemy } from '../types/bluearchive/enemy';
import { IEquipment } from '../types/bluearchive/equipment';
import { IFurniture } from '../types/bluearchive/furniture';
import { IItem } from '../types/bluearchive/item';
import { ILocalization } from '../types/bluearchive/localization.js';
import { IMultiFloorRaid } from '../types/bluearchive/multiFloorRaid.js';
import { IRaid, RaidSkill } from '../types/bluearchive/raid.js';
import { IRaidSeason, Season } from '../types/bluearchive/raidSeason.js';
import { IStudent, Skill as StudentSkill } from '../types/bluearchive/student';
import { ISummon, Skill as SummonSkill } from '../types/bluearchive/summon';
import { ITimeAttack, ITimeAttackRule, Rule } from '../types/bluearchive/timeAttack.js';
import { IWorldRaid } from '../types/bluearchive/worldRaid.js';
import { datetimeConverter } from '../utils/index.js';

const curl = async (url: string) => await axios.get(url);

export const fetchData = {
  student: async function sync() {
    const url = BlueArchiveConstants.STUDENTS_DATA_URL;
    const students: Array<IStudent> = await (await curl(url)).data;
    const promises = students.map(async (student: IStudent) => await importData.student(student));
    cache.set('BA_StudentCount', promises.length);
    console.log(`Students: ${promises.length}`);
    return await Promise.all(promises);
  },
  currency: async function sync() {
    const url = BlueArchiveConstants.CURRENCY_DATA_URL;
    const currencies = await (await curl(url)).data;
    const promises: Array<Promise<ICurrency>> = currencies.map(
      async (currency: ICurrency) => await importData.currency(currency),
    );
    cache.set('BA_CurrencyCount', promises.length);
    console.log(`Currencies: ${promises.length}`);
    return await Promise.all(promises);
  },
  enemy: async function sync() {
    const url = BlueArchiveConstants.ENEMIES_DATA_URL;
    const enemies = await (await curl(url)).data;
    const promises: Array<Promise<IEnemy>> = enemies.map(async (enemy: IEnemy) => await importData.enemy(enemy));
    cache.set('BA_EnemyCount', promises.length);
    console.log(`Enemies: ${promises.length}`);
    return await Promise.all(promises);
  },
  equipment: async function sync() {
    const url = BlueArchiveConstants.EQUIPMENT_DATA_URL;
    const equipments = await (await curl(url)).data;
    const promises: Array<Promise<IEquipment>> = equipments.map(
      async (equipment: IEquipment) => await importData.equipment(equipment),
    );
    cache.set('BA_EquipmentCount', promises.length);
    console.log(`Equipments: ${promises.length}`);
    return await Promise.all(promises);
  },
  furniture: async function sync() {
    const url = BlueArchiveConstants.FURNITURE_DATA_URL;
    const furnitures = await (await curl(url)).data;
    const promises: Array<Promise<IFurniture>> = furnitures.map(
      async (furniture: IFurniture) => await importData.furniture(furniture),
    );
    cache.set('BA_FurnitureCount', promises.length);
    console.log(`Furnitures: ${promises.length}`);
    return await Promise.all(promises);
  },
  item: async function sync() {
    const url = BlueArchiveConstants.ITEMS_DATA_URL;
    const items = await (await curl(url)).data;
    const promises: Array<Promise<IItem>> = items.map(async (item: IItem) => await importData.item(item));
    cache.set('BA_ItemCount', promises.length);
    console.log(`Items: ${promises.length}`);
    return await Promise.all(promises);
  },
  raid: async function sync() {
    const url = BlueArchiveConstants.RAIDS_DATA_URL;
    const raids = await (await curl(url)).data.Raid;
    const promises: Array<Promise<IRaid>> = raids.map(async (raid: IRaid) => await importData.raid(raid));
    cache.set('BA_RaidCount', promises.length);
    console.log(`Raids: ${promises.length}`);
    return await Promise.all(promises);
  },
  raidSeason: async function sync() {
    const url = BlueArchiveConstants.RAIDS_DATA_URL;
    const raidSeasons: Array<IRaidSeason> = await (await curl(url)).data.RaidSeasons;
    const seasons: Array<Season> = raidSeasons
      .map((raidSeason: IRaidSeason, index: number) => {
        return raidSeason.Seasons.map((season: Season) => {
          if (season.SeasonDisplay === 'BETA') {
            season.SeasonDisplay = 0;
          }
          return Object.assign(season, { RegionId: index });
        });
      })
      .flat();
    const promises: Array<Promise<Season>> = seasons
      .flat()
      .map(async (raidSeason: Season) => await importData.raidSeason(raidSeason));
    cache.set('BA_RaidSeasonCount', promises.length);
    console.log(`RaidSeasons: ${promises.length}`);
    return await Promise.all(promises);
  },
  timeAttack: async function sync() {
    const url = BlueArchiveConstants.RAIDS_DATA_URL;
    const raids = await (await curl(url)).data;
    const timeAttacks: Array<ITimeAttack> = raids.TimeAttack;
    const timeAttackRules: Array<ITimeAttackRule> = raids.TimeAttackRules;

    timeAttacks.reduce((acc: Array<ITimeAttack>, timeAttack: ITimeAttack) => {
      const rules: Array<ITimeAttackRule[]> = timeAttack.Rules.map((rule: Rule[]) => {
        return rule.map((rule: Rule) => timeAttackRules.find((timeAttackRule) => timeAttackRule.Id === rule.Id)!);
      });
      timeAttack.Rules = rules;
      acc.push(timeAttack);
      return acc;
    }, []);

    const promises: Array<Promise<ITimeAttack>> = timeAttacks.map(
      async (timeAttack: ITimeAttack) => await importData.timeAttack(timeAttack),
    );
    cache.set('BA_TimeAttackCount', promises.length);
    console.log(`TimeAttacks: ${promises.length}`);
    return await Promise.all(promises);
  },
  worldRaid: async function sync() {
    const url = BlueArchiveConstants.RAIDS_DATA_URL;
    const worldRaids = await (await curl(url)).data.WorldRaid;
    const promises: Array<Promise<IWorldRaid>> = worldRaids.map(
      async (worldRaid: IWorldRaid) => await importData.worldRaid(worldRaid),
    );
    cache.set('BA_WorldRaidCount', promises.length);
    console.log(`WorldRaids: ${promises.length}`);
    return await Promise.all(promises);
  },
  multiFloorRaid: async function sync() {
    const url = BlueArchiveConstants.RAIDS_DATA_URL;
    const multiFloorRaids = await (await curl(url)).data.MultiFloorRaid;
    const promises: Array<Promise<IMultiFloorRaid>> = multiFloorRaids.map(
      async (multiFloorRaid: IMultiFloorRaid) => await importData.multiFloorRaid(multiFloorRaid),
    );
    cache.set('BA_MultiFloorRaidCount', promises.length);
    console.log(`MultiFloorRaids: ${promises.length}`);
    return await Promise.all(promises);
  },
  summon: async function sync() {
    const url = BlueArchiveConstants.SUMMONS_DATA_URL;
    const summons = await (await curl(url)).data;
    const promises: Array<Promise<ISummon>> = summons.map(async (summon: ISummon) => await importData.summon(summon));
    cache.set('BA_SummonCount', promises.length);
    console.log(`Summons: ${promises.length}`);
    return await Promise.all(promises);
  },
};
export const importData = {
  student: async (student: IStudent) =>
    await SchaleDB.Student.findOneAndUpdate({ Id: student.Id }, student, { upsert: true, new: true }),
  currency: async (currency: ICurrency) =>
    await SchaleDB.Currency.findOneAndUpdate({ Id: currency.Id }, currency, { upsert: true, new: true }),
  enemy: async (enemy: IEnemy) =>
    await SchaleDB.Enemy.findOneAndUpdate({ Id: enemy.Id }, enemy, { upsert: true, new: true }),
  equipment: async (equipment: IEquipment) =>
    await SchaleDB.Equipment.findOneAndUpdate({ Id: equipment.Id }, equipment, { upsert: true, new: true }),
  furniture: async (furniture: IFurniture) =>
    await SchaleDB.Furniture.findOneAndUpdate({ Id: furniture.Id }, furniture, { upsert: true, new: true }),
  item: async (item: IItem) => await SchaleDB.Item.findOneAndUpdate({ Id: item.Id }, item, { upsert: true, new: true }),
  raid: async (raid: IRaid) => await SchaleDB.Raid.findOneAndUpdate({ Id: raid.Id }, raid, { upsert: true, new: true }),
  raidSeason: async (raidSeason: Season) =>
    await SchaleDB.RaidSeason.findOneAndUpdate(
      { RegionId: raidSeason.RegionId, Season: raidSeason.SeasonId, RaidId: raidSeason.RaidId },
      raidSeason,
      { upsert: true, new: true },
    ),
  timeAttack: async (timeAttack: ITimeAttack) =>
    await SchaleDB.TimeAttack.findOneAndUpdate({ Id: timeAttack.Id }, timeAttack, { upsert: true, new: true }),
  worldRaid: async (worldRaid: IWorldRaid) =>
    await SchaleDB.WorldRaid.findOneAndUpdate({ Id: worldRaid.Id }, worldRaid, { upsert: true, new: true }),
  multiFloorRaid: async (multiFloorRaid: IMultiFloorRaid) =>
    await SchaleDB.MultiFloorRaid.findOneAndUpdate({ Id: multiFloorRaid.Id }, multiFloorRaid, {
      upsert: true,
      new: true,
    }),
  summon: async (summon: ISummon) =>
    await SchaleDB.Summon.findOneAndUpdate({ Id: summon.Id }, summon, { upsert: true, new: true }),
};
export const getData = {
  getStudentCount: async (regionId: number): Promise<number> =>
    await SchaleDB.Student.countDocuments({ [`IsReleased.${regionId}`]: true }),
  getStudent: async (sort: any, query?: FilterQuery<IStudent>): Promise<Array<IStudent>> =>
    await SchaleDB.Student.find(query ?? {})
      .sort(sort)
      .lean(),
  getStudentById: async (id: number): Promise<IStudent | null> => await SchaleDB.Student.findOne({ Id: id }).lean(),
  getStudentByIds: async (ids: Array<number>): Promise<IStudent[]> =>
    await SchaleDB.Student.find({ Id: { $in: ids } }).lean(),
  getStudentHasBirthdayNextWeek: async (regionId: number): Promise<IStudent[]> => {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let birthdayStudents = [];

    for (var i = 0; i < 7; i++) {
      const nextDate = new Date();
      nextDate.setHours(0, 0, 0, 0);
      birthdayStudents.push(datetimeConverter(nextDate.setDate(currentDate.getDate() + i)).studentBirthday);
    }

    const query = Object.assign({
      PathName: { $regex: /^[^_]*$/i },
      BirthDay: { $in: birthdayStudents },
      [`IsReleased.${regionId}`]: true,
    });

    return await SchaleDB.Student.find(query).sort({ BirthDay: 1 }).lean();
  },
  getRaidCount: async (regionId: number): Promise<number> =>
    await SchaleDB.Raid.countDocuments({ [`IsReleased.${regionId}`]: true }),
  getRaidById: async (id: number): Promise<IRaid | null> => await SchaleDB.Raid.findOne({ Id: id }).lean(),
  getTimeAttackById: async (id: number): Promise<ITimeAttack | null> =>
    await SchaleDB.TimeAttack.findOne({ Id: id }).lean(),
  getFurnitures: async (ids: Array<number>): Promise<Array<IFurniture>> =>
    await SchaleDB.Furniture.find({ Id: { $in: ids } }).lean(),
  getSummons: async (ids: Array<number>): Promise<Array<ISummon>> =>
    await SchaleDB.Summon.find({ Id: { $in: ids } }).lean(),
};

export const transformStudentSkillStat = (skill: StudentSkill | SummonSkill, localization?: ILocalization) => {
  skill.Name = decode(skill.Name).replace(CommonConstants.REGEX_HTML_TAG, '');
  skill.Desc = decode(
    skill.Desc?.replace(BlueArchiveConstants.REGEX_PARAMETERS_REPLACEMENT, (match, key) => {
      let isNumericParameters = true;
      let parameters: Array<string> | undefined;
      if (skill.SkillType === 'ex')
        parameters =
          skill.Parameters &&
          skill.Parameters[parseInt(key) - 1].filter((value, index) => index === 0 || index === 2 || index === 4);
      else
        parameters =
          skill.Parameters &&
          skill.Parameters[parseInt(key) - 1].filter(
            (value, index) => index === 0 || index === 3 || index === 6 || index === 9,
          );
      if (parameters && !parameters[0]) {
        isNumericParameters = false;
        parameters = parameters?.map((parameter: string) => (parameter === '' ? 'No effect' : parameter.trim()));
      }

      return parameters ? (isNumericParameters ? parameters.join('/') : ` + (${parameters.join('/')})`) : match;
    })
      .replace(BlueArchiveConstants.REGEX_BUFF_REPLACEMENT, (match, key) => {
        key = 'Buff_' + key;
        const value = localization && localization.BuffName[key];
        return value ?? match;
      })

      .replace(BlueArchiveConstants.REGEX_DEBUFF_REPLACEMENT, (match, key) => {
        key = 'Debuff_' + key;
        const value = localization && localization.BuffName[key];
        return value ?? match;
      })
      .replace(BlueArchiveConstants.REGEX_SPECIAL_REPLACEMENT, (match, key) => {
        key = 'Special_' + key;
        const value = localization && localization.BuffName[key];
        return value ?? match;
      })
      .replace(BlueArchiveConstants.REGEX_CC_REPLACEMENT, (match, key) => {
        key = 'CC_' + key;
        const value = localization && localization.BuffName[key];
        return value ?? match;
      })

      .replace(CommonConstants.REGEX_HTML_TAG, ''),
  );

  return skill;
};
export const transformRaidSkillStat = (skill: RaidSkill, difficulty: number, localization?: ILocalization) => {
  skill.Name = `[${skill.SkillType}] ${decode(skill.Name).replace(CommonConstants.REGEX_HTML_TAG, '')}${
    skill.ATGCost > 0 ? ` \`ATG: ${skill.ATGCost}\`` : ''
  }`;
  skill.Desc = decode(
    skill.Desc?.replace(BlueArchiveConstants.REGEX_PARAMETERS_REPLACEMENT, (match, key) => {
      return skill.Parameters![parseInt(key) - 1][difficulty];
    })
      .replace(BlueArchiveConstants.REGEX_BUFF_REPLACEMENT, (match, key) => {
        key = 'Buff_' + key;
        const value = localization && localization.BuffName[key];
        return value ?? match;
      })

      .replace(BlueArchiveConstants.REGEX_DEBUFF_REPLACEMENT, (match, key) => {
        key = 'Debuff_' + key;
        const value = localization && localization.BuffName[key];
        return value ?? match;
      })
      .replace(BlueArchiveConstants.REGEX_SPECIAL_REPLACEMENT, (match, key) => {
        key = 'Special_' + key;
        const value = localization && localization.BuffName[key];
        return value ?? match;
      })
      .replace(BlueArchiveConstants.REGEX_CC_REPLACEMENT, (match, key) => {
        key = 'CC_' + key;
        const value = localization && localization.BuffName[key];
        return value ?? match;
      })

      .replace(CommonConstants.REGEX_HTML_TAG, ''),
  );

  return skill;
};

export const SchaleMath = {
  criticalRate: (criticalPoint: number) => Math.floor(criticalPoint / 100),
  stabilityRate: (stabilityPoint: number) => ((stabilityPoint / (stabilityPoint + 1000) + 0.2) * 100).toFixed(2),
  getWeaponStats: (student: IStudent, level: number = BlueArchiveConstants.WEAPON_MAX_LEVEL) => {
    let weaponStats = { MaxHP: 0, AttackPower: 0, HealPower: 0 };
    let levelscale: number = (level - 1) / 99;
    if (student.Weapon.StatLevelUpType == 'Standard') levelscale = parseFloat(levelscale.toFixed(4));

    weaponStats['AttackPower'] = Math.round(
      student.Weapon.AttackPower1 + (student.Weapon.AttackPower100 - student.Weapon.AttackPower1) * levelscale,
    );
    weaponStats['MaxHP'] = Math.round(
      student.Weapon.MaxHP1 + (student.Weapon.MaxHP100 - student.Weapon.MaxHP1) * levelscale,
    );
    weaponStats['HealPower'] = Math.round(
      student.Weapon.HealPower1 + (student.Weapon.HealPower100 - student.Weapon.HealPower1) * levelscale,
    );
    return weaponStats;
  },
  getStudentStats: (student: IStudent, level: number = BlueArchiveConstants.STUDENT_MAX_LEVEL) => {
    let studentStats = { MaxHP: 0, AttackPower: 0, DefensePower: 0, HealPower: 0 };

    let transcendenceAttack = 1;
    let transcendenceHP = 1;
    let transcendenceHeal = 1;

    for (let i = 0; i < student.StarGrade; i++) {
      transcendenceAttack += BlueArchiveConstants.TRANSCENDENCE.AttackPower[i] / 10000;
      transcendenceHP += BlueArchiveConstants.TRANSCENDENCE.MaxHP[i] / 10000;
      transcendenceHeal += BlueArchiveConstants.TRANSCENDENCE.HealPower[i] / 10000;
    }

    studentStats.MaxHP = Math.ceil(
      parseFloat(
        (
          Math.round(
            parseFloat(
              (student.MaxHP1 + (student.MaxHP100 - student.MaxHP1) * BlueArchiveConstants.LEVEL_SCALE(level)).toFixed(
                4,
              ),
            ),
          ) * transcendenceHP
        ).toFixed(4),
      ),
    );
    studentStats.AttackPower = Math.ceil(
      parseFloat(
        Math.round(
          parseFloat(
            (
              student.AttackPower1 +
              (student.AttackPower100 - student.AttackPower1) * BlueArchiveConstants.LEVEL_SCALE(level)
            ).toFixed(4),
          ) * transcendenceAttack,
        ).toFixed(4),
      ),
    );
    studentStats.DefensePower = Math.round(
      parseFloat(
        (
          student.DefensePower1 +
          (student.DefensePower100 - student.DefensePower1) * BlueArchiveConstants.LEVEL_SCALE(level)
        ).toFixed(4),
      ),
    );
    studentStats.HealPower = Math.ceil(
      parseFloat(
        Math.round(
          parseFloat(
            (
              student.HealPower1 +
              (student.HealPower100 - student.HealPower1) * BlueArchiveConstants.LEVEL_SCALE(level)
            ).toFixed(4),
          ) * transcendenceHeal,
        ).toFixed(4),
      ),
    );
    return studentStats;
  },
  getBondStats: (student: IStudent, level: number) => {
    var stat1 = 0,
      stat2 = 0;
    for (let i = 1; i < Math.min(level, 50); i++) {
      if (i < 20) {
        stat1 += student.FavorStatValue[Math.floor(i / 5)][0];
        stat2 += student.FavorStatValue[Math.floor(i / 5)][1];
      } else if (i < 50) {
        stat1 += student.FavorStatValue[2 + Math.floor(i / 10)][0];
        stat2 += student.FavorStatValue[2 + Math.floor(i / 10)][1];
      }
    }
    return { [student.FavorStatType[0]]: stat1, [student.FavorStatType[1]]: stat2 };
  },
};
