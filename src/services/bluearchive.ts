import axios from 'axios';
import { decode } from 'html-entities';
import { BlueArchiveConstants, CommonConstants } from '../constants/index.js';
import { SchaleDB } from '../models/BlueArchive.js';
import { ICurrency } from '../types/bluearchive/currency';
import { IEnemy } from '../types/bluearchive/enemy';
import { IEquipment } from '../types/bluearchive/equipment';
import { IFurniture } from '../types/bluearchive/furniture';
import { IItem } from '../types/bluearchive/item';
import { ILocalization } from '../types/bluearchive/localization.js';
import { Raid } from '../types/bluearchive/raid.js';
import { IStudent, Skill } from '../types/bluearchive/student';
import { ISummon } from '../types/bluearchive/summon';

const curl = async (url: string) => await axios.get(url);

export const fetchData = {
  student: async function sync() {
    const url = BlueArchiveConstants.STUDENTS_DATA_URL;
    const students: Array<IStudent> = await (await curl(url)).data;
    const promises = students.map(async (student: IStudent) => await importData.student(student));
    console.log(`Students: ${promises.length}`);
    return await Promise.all(promises);
  },
  currency: async function sync() {
    const url = BlueArchiveConstants.CURRENCY_DATA_URL;
    const currencies = await (await curl(url)).data;
    const promises: Array<Promise<ICurrency>> = currencies.map(
      async (currency: ICurrency) => await importData.currency(currency),
    );
    console.log(`Currencies: ${promises.length}`);
    return await Promise.all(promises);
  },
  enemy: async function sync() {
    const url = BlueArchiveConstants.ENEMIES_DATA_URL;
    const enemies = await (await curl(url)).data;
    const promises: Array<Promise<IEnemy>> = enemies.map(async (enemy: IEnemy) => await importData.enemy(enemy));
    console.log(`Enemies: ${promises.length}`);
    return await Promise.all(promises);
  },
  equipment: async function sync() {
    const url = BlueArchiveConstants.EQUIPMENT_DATA_URL;
    const equipments = await (await curl(url)).data;
    const promises: Array<Promise<IEquipment>> = equipments.map(
      async (equipment: IEquipment) => await importData.equipment(equipment),
    );
    console.log(`Equipments: ${promises.length}`);
    return await Promise.all(promises);
  },
  furniture: async function sync() {
    const url = BlueArchiveConstants.FURNITURE_DATA_URL;
    const furnitures = await (await curl(url)).data;
    const promises: Array<Promise<IFurniture>> = furnitures.map(
      async (furniture: IFurniture) => await importData.furniture(furniture),
    );
    console.log(`Furnitures: ${promises.length}`);
    return await Promise.all(promises);
  },
  item: async function sync() {
    const url = BlueArchiveConstants.ITEMS_DATA_URL;
    const items = await (await curl(url)).data;
    const promises: Array<Promise<IItem>> = items.map(async (item: IItem) => await importData.item(item));
    console.log(`Items: ${promises.length}`);
    return await Promise.all(promises);
  },
  raid: async function sync() {
    const url = BlueArchiveConstants.RAIDS_DATA_URL;
    const raids = await (await curl(url)).data.Raid;
    const promises: Array<Promise<Raid>> = raids.map(async (raid: Raid) => await importData.raid(raid));
    console.log(`Raids: ${promises.length}`);
    return await Promise.all(promises);
  },
  summon: async function sync() {
    const url = BlueArchiveConstants.SUMMONS_DATA_URL;
    const summons = await (await curl(url)).data;
    const promises: Array<Promise<ISummon>> = summons.map(async (summon: ISummon) => await importData.summon(summon));
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
  raid: async (raid: Raid) => await SchaleDB.Raid.findOneAndUpdate({ Id: raid.Id }, raid, { upsert: true, new: true }),
  summon: async (summon: ISummon) =>
    await SchaleDB.Summon.findOneAndUpdate({ Id: summon.Id }, summon, { upsert: true, new: true }),
};
export const getData = {
  getStudent: async (sort: any, query?: Partial<IStudent>): Promise<Array<IStudent>> =>
    await SchaleDB.Student.find(query ?? {})
      .sort(sort)
      .lean(),
  getStudentById: async (id: number): Promise<IStudent | null> => await SchaleDB.Student.findOne({ Id: id }).lean(),
};

export const transformSkillStat = (skill: Skill, localization?: ILocalization) => {
  skill.Name = decode(skill.Name).replace(CommonConstants.REGEX_HTML_TAG, '');
  skill.Desc = decode(
    skill.Desc?.replace(BlueArchiveConstants.REGEX_BUFF_REPLACEMENT, (match, key) => {
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
      .replace(BlueArchiveConstants.REGEX_PARAMETERS_REPLACEMENT, (match, key) => {
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
      .replace(CommonConstants.REGEX_HTML_TAG, ''),
  );

  return skill;
};

export const SchaleMath = {
  criticalRate: (criticalPoint: number) => Math.floor(criticalPoint / 100),
  stabilityRate: (stabilityPoint: number) => ((stabilityPoint / (stabilityPoint + 1000) + 0.2) * 100).toFixed(2),
};
