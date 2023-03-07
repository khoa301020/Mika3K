import axios from 'axios';
import { BlueArchiveConstants } from '../constants/bluearchive.js';
import { SchaleDB } from '../models/BlueArchive.js';
import { ICurrency } from '../types/bluearchive/currency';
import { IEnemy } from '../types/bluearchive/enemy';
import { IEquipment } from '../types/bluearchive/equipment';
import { IFurniture } from '../types/bluearchive/furniture';
import { IItem } from '../types/bluearchive/item';
import { IRaid } from '../types/bluearchive/raid';
import { IStudent } from '../types/bluearchive/student';
import { ISummon } from '../types/bluearchive/summon';

const curl = async (url: string) => await axios.get(url);

export const fetchData = {
  student: async function sync() {
    const url = BlueArchiveConstants.STUDENTS_DATA_URL;
    const students = await (await curl(url)).data;
    students.forEach(async (student: IStudent) => {
      const result = await importData.student(student);
      console.log('Imported ' + result.Name);
    });
  },
  currency: async function sync() {
    const url = BlueArchiveConstants.CURRENCY_DATA_URL;
    const currencies = await (await curl(url)).data;
    currencies.forEach(async (currency: ICurrency) => {
      const result = await importData.currency(currency);
      console.log('Imported ' + result.Name);
    });
  },
  enemy: async function sync() {
    const url = BlueArchiveConstants.ENEMIES_DATA_URL;
    const enemies = await (await curl(url)).data;
    enemies.forEach(async (enemy: IEnemy) => {
      const result = await importData.enemy(enemy);
      console.log('Imported ' + result.Name);
    });
  },
  equipment: async function sync() {
    const url = BlueArchiveConstants.EQUIPMENT_DATA_URL;
    const equipments = await (await curl(url)).data;
    equipments.forEach(async (equipment: IEquipment) => {
      const result = await importData.equipment(equipment);
      console.log('Imported ' + result.Name);
    });
  },
  furniture: async function sync() {
    const url = BlueArchiveConstants.FURNITURE_DATA_URL;
    const furnitures = await (await curl(url)).data;
    furnitures.forEach(async (furniture: IFurniture) => {
      const result = await importData.furniture(furniture);
      console.log('Imported ' + result.Name);
    });
  },
  item: async function sync() {
    const url = BlueArchiveConstants.ITEMS_DATA_URL;
    const items = await (await curl(url)).data;
    items.forEach(async (item: IItem) => {
      const result = await importData.item(item);
      console.log('Imported ' + result.Name);
    });
  },
  raid: async function sync() {
    const url = BlueArchiveConstants.RAIDS_DATA_URL;
    const raidlist = await (await curl(url)).data;
    raidlist.Raid.forEach(async (raid: IRaid) => {
      const result = await importData.raid(raid);
    });
  },
  summon: async function sync() {
    const url = BlueArchiveConstants.SUMMONS_DATA_URL;
    const summons = await (await curl(url)).data;
    summons.forEach(async (summon: ISummon) => {
      const result = await importData.summon(summon);
      console.log('Imported ' + result.Name);
    });
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
  raid: async (raid: any) => await SchaleDB.Raid.findOneAndUpdate({ Id: raid.Id }, raid, { upsert: true, new: true }),
  summon: async (summon: ISummon) =>
    await SchaleDB.Summon.findOneAndUpdate({ Id: summon.Id }, summon, { upsert: true, new: true }),
};
