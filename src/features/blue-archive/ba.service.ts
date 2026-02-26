import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model, Schema } from 'mongoose';
import { decode } from 'html-entities';
import { AppHttpService } from '../../shared/http';
import { AppCacheService } from '../../shared/cache';
import * as C from './ba.constants';
import type { IStudent, Skill as StudentSkill } from './types/student';
import type { ISummon, Skill as SummonSkill } from './types/summon';
import type { IRaid, RaidSkill } from './types/raid';
import type { IRaidSeason, Season } from './types/raidSeason';
import type { ITimeAttack, ITimeAttackRule } from './types/timeAttack';
import type { IConfig } from './types/config';
import type { ILocalization } from './types/localization';
import type { IFurniture } from './types/furniture';
import { datetimeConverter } from '../../shared/utils';

// Helper to create a passthrough schema (strict: false accepts any data)
const anySchema = () => new Schema({}, { strict: false });

@Injectable()
export class BaService implements OnModuleInit {
  private readonly logger = new Logger(BaService.name);
  private models: Record<string, Model<any>> = {};

  constructor(
    private readonly httpService: AppHttpService,
    private readonly cacheService: AppCacheService,
    private readonly configService: ConfigService,
    @InjectConnection('ba') private readonly baConnection: Connection,
  ) {}

  async onModuleInit() {
    // Register all SchaleDB models on the BA connection
    const collections = [
      'Students',
      'Currencies',
      'Enemies',
      'Equipments',
      'Furnitures',
      'Items',
      'Raids',
      'RaidSeasons',
      'TimeAttacks',
      'WorldRaids',
      'MultiFloorRaids',
      'Summons',
    ];
    for (const col of collections) {
      const singular = col.replace(/s$/, '').replace(/ie$/, 'y');
      this.models[col] = this.baConnection.model(singular, anySchema(), col);
    }

    // Initial data sync
    await this.cacheCommonData();
    await this.syncAll();
    this.logger.log('SchaleDB data synced on startup');
  }

  // --- Cache ---

  async cacheCommonData() {
    const [localization, config] = await Promise.all([
      this.httpService.get(C.LOCALIZATION_DATA_URL).then((r: any) => r.data),
      this.httpService.get(C.CONFIG_DATA_URL).then((r: any) => r.data),
    ]);
    await this.cacheService.set<ILocalization>('BA_Localization', localization);
    await this.cacheService.set<IConfig>('BA_Common', config);
  }

  // --- Fetch + Import ---

  private async fetchAndImport(
    url: string,
    modelName: string,
    dataPath?: string,
  ) {
    const response = await this.httpService.get(url);
    let items = response.data;
    if (dataPath) items = items[dataPath];
    const model = this.models[modelName];
    const promises = items.map((item: any) =>
      model.findOneAndUpdate({ Id: item.Id }, item, {
        upsert: true,
        returnDocument: 'after',
      }),
    );
    const results = await Promise.all(promises);
    await this.cacheService.set(`BA_${modelName}Count`, results.length);
    return results;
  }

  async syncAll() {
    await Promise.all([
      this.fetchAndImport(C.STUDENTS_DATA_URL, 'Students'),
      this.fetchAndImport(C.CURRENCY_DATA_URL, 'Currencies'),
      this.fetchAndImport(C.ENEMIES_DATA_URL, 'Enemies'),
      this.fetchAndImport(C.EQUIPMENT_DATA_URL, 'Equipments'),
      this.fetchAndImport(C.FURNITURE_DATA_URL, 'Furnitures'),
      this.fetchAndImport(C.ITEMS_DATA_URL, 'Items'),
      this.fetchAndImport(C.RAIDS_DATA_URL, 'Raids', 'Raid'),
      this.fetchAndImport(C.SUMMONS_DATA_URL, 'Summons'),
      this.syncRaidSeasons(),
      this.syncTimeAttacks(),
      this.fetchAndImport(C.RAIDS_DATA_URL, 'WorldRaids', 'WorldRaid'),
      this.fetchAndImport(
        C.RAIDS_DATA_URL,
        'MultiFloorRaids',
        'MultiFloorRaid',
      ),
    ]);
  }

  private async syncRaidSeasons() {
    const response = await this.httpService.get(C.RAIDS_DATA_URL);
    const raidSeasons: IRaidSeason[] = response.data.RaidSeasons;
    const seasons: Season[] = raidSeasons
      .map((rs: IRaidSeason, index: number) =>
        rs.Seasons.map((s: Season) => {
          if (s.SeasonDisplay === 'BETA') s.SeasonDisplay = 0;
          return Object.assign(s, { RegionId: index });
        }),
      )
      .flat();
    const model = this.models['RaidSeasons'];
    const promises = seasons.map((s: Season) =>
      model.findOneAndUpdate(
        { RegionId: s.RegionId, Season: s.SeasonId, RaidId: s.RaidId },
        s,
        { upsert: true, returnDocument: 'after' },
      ),
    );
    const results = await Promise.all(promises);
    await this.cacheService.set('BA_RaidSeasonsCount', results.length);
  }

  private async syncTimeAttacks() {
    const response = await this.httpService.get(C.RAIDS_DATA_URL);
    const raids = response.data;
    const timeAttacks: ITimeAttack[] = raids.TimeAttack;
    const timeAttackRules: ITimeAttackRule[] = raids.TimeAttackRules;

    timeAttacks.forEach((ta: ITimeAttack) => {
      ta.Rules = ta.Rules.map((rule: any) =>
        rule.map((r: any) => timeAttackRules.find((tar) => tar.Id === r.Id)!),
      );
    });

    const model = this.models['TimeAttacks'];
    const promises = timeAttacks.map((ta) =>
      model.findOneAndUpdate({ Id: ta.Id }, ta, {
        upsert: true,
        returnDocument: 'after',
      }),
    );
    const results = await Promise.all(promises);
    await this.cacheService.set('BA_TimeAttacksCount', results.length);
  }

  // --- Data Queries ---

  async getStudentCount(regionId: number): Promise<number> {
    return this.models['Students'].countDocuments({
      [`IsReleased.${regionId}`]: true,
    });
  }

  async getStudent(
    sort: any,
    query?: Record<string, any>,
  ): Promise<IStudent[]> {
    const students = await this.models['Students']
      .find(query ?? {})
      .sort(sort)
      .lean();
    const localization =
      await this.cacheService.get<ILocalization>('BA_Localization');
    students.forEach((doc: any) => {
      doc.SchoolLong = localization
        ? localization.SchoolLong[doc.School]
        : doc.School;
      doc.Club = localization ? localization.Club[doc.Club] : doc.Club;
      doc.SquadType = localization
        ? localization.SquadType[doc.SquadType]
        : doc.SquadType;
      doc.TacticRoleLong = localization
        ? localization.TacticRole[doc.TacticRole]
        : doc.TacticRole;
      doc.ArmorType = localization
        ? localization.ArmorTypeLong[doc.ArmorType]
        : doc.ArmorType;
    });
    return students;
  }

  async getStudentById(id: number): Promise<IStudent | null> {
    return this.models['Students'].findOne({ Id: id }).lean();
  }

  async getStudentByIds(ids: number[]): Promise<IStudent[]> {
    return this.models['Students'].find({ Id: { $in: ids } }).lean();
  }

  async getStudentHasBirthdayNextWeek(regionId: number): Promise<IStudent[]> {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const birthdayStrings: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(currentDate.getDate() + i);
      birthdayStrings.push(datetimeConverter(d).studentBirthday);
    }
    return this.models['Students']
      .find({
        PathName: { $regex: /^[^_]*$/i },
        BirthDay: { $in: birthdayStrings },
        [`IsReleased.${regionId}`]: true,
      })
      .sort({ BirthDay: 1 })
      .lean();
  }

  async getRaidCount(regionId: number): Promise<number> {
    return this.models['Raids'].countDocuments({
      [`IsReleased.${regionId}`]: true,
    });
  }

  async getRaidById(id: number): Promise<IRaid | null> {
    const raid: any = await this.models['Raids'].findOne({ Id: id }).lean();
    if (!raid) return null;
    // Populate boss list
    raid.BossList = [];
    const promises = raid.EnemyList.map((enemies: number[], index: number) =>
      this.models['Enemies']
        .find({ Id: { $in: enemies }, Rank: 'Boss' })
        .lean()
        .then((bosses: any[]) => {
          raid.BossList[index] = bosses;
        }),
    );
    await Promise.all(promises);
    return raid;
  }

  async getTimeAttackById(id: number): Promise<ITimeAttack | null> {
    return this.models['TimeAttacks'].findOne({ Id: id }).lean();
  }

  async getFurnitures(ids: number[]): Promise<IFurniture[]> {
    return this.models['Furnitures'].find({ Id: { $in: ids } }).lean();
  }

  async getSummons(ids: number[]): Promise<ISummon[]> {
    return this.models['Summons'].find({ Id: { $in: ids } }).lean();
  }

  // --- Math helpers ---

  static criticalRate(criticalPoint: number) {
    return Math.floor(criticalPoint / 100);
  }
  static stabilityRate(stabilityPoint: number) {
    return ((stabilityPoint / (stabilityPoint + 1000) + 0.2) * 100).toFixed(2);
  }

  static getWeaponStats(student: IStudent, level = C.WEAPON_MAX_LEVEL) {
    let levelscale: number = (level - 1) / 99;
    if (student.Weapon.StatLevelUpType === 'Standard')
      levelscale = parseFloat(levelscale.toFixed(4));
    return {
      AttackPower: Math.round(
        student.Weapon.AttackPower1 +
          (student.Weapon.AttackPower100 - student.Weapon.AttackPower1) *
            levelscale,
      ),
      MaxHP: Math.round(
        student.Weapon.MaxHP1 +
          (student.Weapon.MaxHP100 - student.Weapon.MaxHP1) * levelscale,
      ),
      HealPower: Math.round(
        student.Weapon.HealPower1 +
          (student.Weapon.HealPower100 - student.Weapon.HealPower1) *
            levelscale,
      ),
    };
  }

  static getStudentStats(student: IStudent, level = C.STUDENT_MAX_LEVEL) {
    let tAtk = 1,
      tHP = 1,
      tHeal = 1;
    for (let i = 0; i < student.StarGrade; i++) {
      tAtk += C.TRANSCENDENCE.AttackPower[i] / 10000;
      tHP += C.TRANSCENDENCE.MaxHP[i] / 10000;
      tHeal += C.TRANSCENDENCE.HealPower[i] / 10000;
    }
    const ls = C.LEVEL_SCALE(level);
    return {
      MaxHP: Math.ceil(
        parseFloat(
          (
            Math.round(
              parseFloat(
                (
                  student.MaxHP1 +
                  (student.MaxHP100 - student.MaxHP1) * ls
                ).toFixed(4),
              ),
            ) * tHP
          ).toFixed(4),
        ),
      ),
      AttackPower: Math.ceil(
        parseFloat(
          Math.round(
            parseFloat(
              (
                student.AttackPower1 +
                (student.AttackPower100 - student.AttackPower1) * ls
              ).toFixed(4),
            ) * tAtk,
          ).toFixed(4),
        ),
      ),
      DefensePower: Math.round(
        parseFloat(
          (
            student.DefensePower1 +
            (student.DefensePower100 - student.DefensePower1) * ls
          ).toFixed(4),
        ),
      ),
      HealPower: Math.ceil(
        parseFloat(
          Math.round(
            parseFloat(
              (
                student.HealPower1 +
                (student.HealPower100 - student.HealPower1) * ls
              ).toFixed(4),
            ) * tHeal,
          ).toFixed(4),
        ),
      ),
    };
  }

  static getBondStats(student: IStudent, level: number) {
    let stat1 = 0,
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
    return {
      [student.FavorStatType[0]]: stat1,
      [student.FavorStatType[1]]: stat2,
    };
  }

  // --- Skill transformation ---

  private static applyBuffLocalization(
    desc: string | undefined,
    localization?: ILocalization,
  ) {
    if (!desc) return '';
    return decode(
      desc
        .replace(
          C.REGEX_BUFF_REPLACEMENT,
          (_m: string, k: string) => localization?.BuffName['Buff_' + k] ?? _m,
        )
        .replace(
          C.REGEX_DEBUFF_REPLACEMENT,
          (_m: string, k: string) =>
            localization?.BuffName['Debuff_' + k] ?? _m,
        )
        .replace(
          C.REGEX_SPECIAL_REPLACEMENT,
          (_m: string, k: string) =>
            localization?.BuffName['Special_' + k] ?? _m,
        )
        .replace(
          C.REGEX_CC_REPLACEMENT,
          (_m: string, k: string) => localization?.BuffName['CC_' + k] ?? _m,
        )
        .replace(C.REGEX_HTML_TAG, ''),
    );
  }

  static transformStudentSkillStat(
    skill: StudentSkill | SummonSkill,
    localization?: ILocalization,
  ) {
    skill.Name = decode(skill.Name).replace(C.REGEX_HTML_TAG, '');
    const preProcessed = skill.Desc?.replace(
      C.REGEX_PARAMETERS_REPLACEMENT,
      (_match: string, key: string) => {
        let isNumeric = true;
        let parameters: string[] | undefined;
        if (skill.SkillType === 'ex')
          parameters = skill.Parameters?.[parseInt(key) - 1]?.filter(
            (_: any, idx: number) => idx === 0 || idx === 2 || idx === 4,
          );
        else
          parameters = skill.Parameters?.[parseInt(key) - 1]?.filter(
            (_: any, idx: number) =>
              idx === 0 || idx === 3 || idx === 6 || idx === 9,
          );
        if (parameters && !parameters[0]) {
          isNumeric = false;
          parameters = parameters.map((p: string) =>
            !p ? 'No effect' : p.trim(),
          );
        }
        return parameters
          ? isNumeric
            ? parameters.join('/')
            : ` + (${parameters.join('/')})`
          : _match;
      },
    );
    skill.Desc = this.applyBuffLocalization(preProcessed, localization);
    return skill;
  }

  static transformRaidSkillStat(
    skill: RaidSkill,
    difficulty: number,
    localization?: ILocalization,
  ) {
    skill.Name = `[${skill.SkillType}] ${decode(skill.Name).replace(C.REGEX_HTML_TAG, '')}${skill.ATGCost > 0 ? ` \`ATG: ${skill.ATGCost}\`` : ''}`;
    const preProcessed = skill.Desc?.replace(
      C.REGEX_PARAMETERS_REPLACEMENT,
      (_m: string, k: string) => skill.Parameters![parseInt(k) - 1][difficulty],
    );
    skill.Desc = this.applyBuffLocalization(preProcessed, localization);
    return skill;
  }
}
