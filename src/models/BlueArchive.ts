import mongoose from 'mongoose';
import { ICurrency } from '../types/bluearchive/currency';
import { IEnemy } from '../types/bluearchive/enemy';
import { IEquipment } from '../types/bluearchive/equipment';
import { IFurniture } from '../types/bluearchive/furniture';
import { IItem } from '../types/bluearchive/item';
import { IRaid } from '../types/bluearchive/raid';
import { IStudent } from '../types/bluearchive/student';
import { ISummon } from '../types/bluearchive/summon';

const StudentSchema = new mongoose.Schema<IStudent>({}, { strict: false });
const CurrencySchema = new mongoose.Schema<ICurrency>({}, { strict: false });
const EnemySchema = new mongoose.Schema<IEnemy>({}, { strict: false });
const EquipmentSchema = new mongoose.Schema<IEquipment>({}, { strict: false });
const FurnitureSchema = new mongoose.Schema<IFurniture>({}, { strict: false });
const ItemSchema = new mongoose.Schema<IItem>({}, { strict: false });
const RaidSchema = new mongoose.Schema<IRaid>({}, { strict: false });
const SummonSchema = new mongoose.Schema<ISummon>({}, { strict: false });

const conn = mongoose.createConnection(process.env.MONGO_URI_BA!);

export const SchaleDB = {
  Student: conn.model<IStudent>('Student', StudentSchema, 'BA_Students'),
  Currency: conn.model<ICurrency>('Currency', CurrencySchema, 'BA_Currencies'),
  Enemy: conn.model<IEnemy>('Enemy', EnemySchema, 'BA_Enemies'),
  Equipment: conn.model<IEquipment>('Equipment', EquipmentSchema, 'BA_Equipments'),
  Furniture: conn.model<IFurniture>('Furniture', FurnitureSchema, 'BA_Furnitures'),
  Item: conn.model<IItem>('Item', ItemSchema, 'BA_Items'),
  Raid: conn.model<IRaid>('Raid', RaidSchema, 'BA_Raids'),
  Summon: conn.model<ISummon>('Summon', SummonSchema, 'BA_Summons'),
};
