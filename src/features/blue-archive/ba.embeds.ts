import { Injectable } from '@nestjs/common';
import type { APIEmbedField, User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { decode } from 'html-entities';
import { AppCacheService } from '../../shared/cache';
import { BaService } from './ba.service';
import * as C from './ba.constants';
import type { IStudent, Skill, Equipment } from './types/student';
import type { IFurniture } from './types/furniture';
import type { IRaid, RaidSkill } from './types/raid';
import type { IEnemy } from './types/enemy';
import type { Region, CurrentGacha, CurrentEvent } from './types/config';
import type { ILocalization } from './types/localization';
import {
  datetimeConverter,
  convertTZ,
  formatString,
  isEnded,
  getRelativeTimeBA,
  average,
} from '../../shared/utils';

function schaleFooter(page?: number, total?: number) {
  return {
    text: `SCHALE.gg${page != null && total != null ? ` (${page}/${total})` : ''}`,
    iconURL: C.SCHALE_GG_LOGO,
  };
}

@Injectable()
export class BaEmbeds {
  constructor(private readonly cacheService: AppCacheService) {}

  private getLocalization(): Promise<ILocalization | undefined> {
    return this.cacheService.get<ILocalization>('BA_Localization');
  }

  async server(region: Region, author: User): Promise<EmbedBuilder> {
    const loc = await this.getLocalization();
    const raids = (region.CurrentRaid ?? []).filter(
      (r: any) => r.raid.toString().length < 4 && !isEnded(r.end),
    );
    const gachas = (region.CurrentGacha ?? []).filter(
      (g: CurrentGacha) => !isEnded(g.end),
    );
    const events = (region.CurrentEvents ?? []).filter(
      (e: CurrentEvent) => !isEnded(e.end),
    );

    const today = new Date();
    const todayJP = datetimeConverter(
      convertTZ(today, 'Asia/Tokyo'),
    ).studentBirthday;
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowJP = datetimeConverter(
      convertTZ(tomorrow, 'Asia/Tokyo'),
    ).studentBirthday;

    const fields: APIEmbedField[] = [
      {
        name: 'No. students',
        value: `${region.studentsCount ?? 0}`,
        inline: true,
      },
      { name: 'No. raids', value: `${region.raidsCount ?? 0}`, inline: true },
      {
        name: 'No. events',
        value: `${region.eventsCount ?? 0} (${region.rerunEventsCount ?? 0})`,
        inline: true,
      },
      {
        name: 'Student',
        value: `Level ${region.StudentMaxLevel}`,
        inline: true,
      },
      { name: 'Weapon', value: `Level ${region.WeaponMaxLevel}`, inline: true },
      { name: 'Bond', value: `Level ${region.BondMaxLevel}`, inline: true },
      {
        name: 'Gear',
        value: `Tier ${region.EquipmentMaxLevel?.join('/')}`,
        inline: true,
      },
      { name: 'Mission', value: `Area ${region.CampaignMax}`, inline: true },
      { name: 'Bounty', value: `Stage ${region.ChaserMax}`, inline: true },
    ];

    if (gachas.length > 0) {
      fields.push({
        name: 'Current banner',
        value: gachas
          .map(
            (g: any) =>
              `• *${getRelativeTimeBA(g.start, g.end)}*\nㅤ- ${g.characters.map((c: any) => `[${'★'.repeat(c.StarGrade)}] ${c.Name}`).join('\nㅤ- ')}`,
          )
          .join('\n'),
      });
    }

    if (region.incomingBirthdayStudents?.length) {
      fields.push({
        name: "Upcoming student's birthday",
        value: region.incomingBirthdayStudents
          .map(
            (s: IStudent) =>
              `ㅤ- [${s.Birthday}] ${s.Name} ${s.BirthDay === todayJP ? 'ー **TODAY!**' : s.BirthDay === tomorrowJP ? 'ー **TOMORROW!**' : ''}`,
          )
          .join('\n'),
      });
    }

    if (events.length > 0) {
      fields.push({
        name: 'Current & upcoming events',
        value: events
          .map(
            (e: CurrentEvent) =>
              `- ${!/^10/.test(e.event.toString()) ? loc?.EventName[e.event.toString()] : `[Rerun] ${loc?.EventName[e.event.toString().slice(2)]}`} *(${getRelativeTimeBA(e.start, e.end)})*`,
          )
          .join('\n'),
      });
    }

    if (raids.length > 0) {
      fields.push({
        name: 'Current & upcoming raids',
        value: raids
          .map(
            (r: any) =>
              `- [${loc?.AdaptationType[r.terrain]}] ${r.info?.Name} *(${getRelativeTimeBA(r.start, r.end)})*`,
          )
          .join('\n'),
      });
    }

    return new EmbedBuilder()
      .setColor(C.DEFAULT_EMBED_COLOR)
      .setTitle(`${region.Name.toUpperCase()} server's status`)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setThumbnail(C.SCHALE_GG_ARONA)
      .addFields(fields)
      .setTimestamp()
      .setFooter({ text: 'SCHALE.gg', iconURL: C.SCHALE_GG_LOGO });
  }

  student(
    student: IStudent,
    author: User,
    page?: number,
    total?: number,
  ): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(C.BULLET_COLOR[student.BulletType])
      .setTitle(`[${'★'.repeat(student.StarGrade)}] ${student.Name}`)
      .setURL(C.SCHALE_STUDENT_URL + student.PathName)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(
        `[${student.Id}] ${student.FamilyName} ${student.PersonalName}`,
      )
      .setThumbnail(C.STUDENT_SCHOOL_LOGO[student.School])
      .addFields(
        {
          name: 'Release',
          value: `${student.IsReleased[1] ? 'Global' : 'JP only'} (${C.STUDENT_TYPE[student.IsLimited]})`,
          inline: true,
        },
        { name: 'Illustrator', value: student.Illustrator, inline: true },
        { name: 'Seiyuu', value: student.CharacterVoice, inline: true },
        { name: 'Birthday', value: student.Birthday, inline: true },
        { name: 'Age', value: student.CharacterAge, inline: true },
        { name: 'Height', value: student.CharHeightMetric, inline: true },
        {
          name: 'School',
          value: student.SchoolLong ?? student.School,
          inline: true,
        },
        { name: 'Squad', value: student.SquadType, inline: true },
        { name: 'Position', value: student.Position, inline: true },
        {
          name: 'Role',
          value: student.TacticRoleLong ?? student.TacticRole,
          inline: true,
        },
        { name: 'Armor', value: student.ArmorType, inline: true },
        {
          name: 'Equipment',
          value: student.Equipment.map(
            (e: Equipment) => C.EQUIPMENT_TYPES[e],
          ).join('/'),
          inline: true,
        },
        {
          name: 'Adaptation',
          value: `\`\`\`Urban: ${C.ADAPTATION_ICON[student.StreetBattleAdaptation]}, Indoor: ${C.ADAPTATION_ICON[student.IndoorBattleAdaptation]}, Outdoor: ${C.ADAPTATION_ICON[student.OutdoorBattleAdaptation]}\`\`\``,
        },
        {
          name: 'Introduction',
          value: `\`\`\`${decode(student.ProfileIntroduction)}\`\`\``,
        },
      )
      .setImage(C.SCHALE_STUDENT_PORTRAIT_URL(student.Id))
      .setTimestamp()
      .setFooter(schaleFooter(page, total));
  }

  async studentProfile(
    student: IStudent,
    author: User,
    furnitures: IFurniture[],
  ): Promise<EmbedBuilder> {
    const loc = await this.getLocalization();
    return new EmbedBuilder()
      .setColor(C.BULLET_COLOR[student.BulletType])
      .setTitle(`[${'★'.repeat(student.StarGrade)}] ${student.Name}'s profile`)
      .setURL(C.SCHALE_STUDENT_URL + student.PathName)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(
        `[${student.Id}] ${student.FamilyName} ${student.PersonalName}`,
      )
      .setThumbnail(C.SCHALE_STUDENT_ICON_URL(student.Id))
      .addFields(
        { name: 'Hobbies', value: `\`\`\`${student.Hobby}\`\`\`` },
        {
          name: 'Favorite item tags',
          value: `\`\`\`${student.FavorItemTags?.length > 0 ? student.FavorItemTags.join(', ') : 'N/A'}\`\`\``,
        },
        {
          name: 'Furniture interaction',
          value: `\`\`\`${furnitures?.length > 0 ? furnitures.map((f) => `[${f.Rarity}] ${f.Name}`).join('\n') : 'N/A'}\`\`\``,
        },
        {
          name: 'Relationship rank bonus',
          value: `\`\`\`${[10, 20, 30, 40, 50]
            .map((level) => {
              const stats = BaService.getBondStats(student, level);
              return `Rank ${level}: ${Object.keys(stats)
                .map((k) => `${stats[k]} ${loc?.Stat[k]}`)
                .join(', ')}`;
            })
            .join('\n')}\`\`\``,
        },
        {
          name: `Recollection lobby (BGM: ${student.MemoryLobbyBGM})`,
          value: `Unlocks at **rank ${student.MemoryLobby[0]}**.`,
        },
      )
      .setImage(C.SCHALE_STUDENT_LOBBY_URL(student.Id))
      .setTimestamp()
      .setFooter({ text: 'SCHALE.gg', iconURL: C.SCHALE_GG_LOGO });
  }

  studentStats(student: IStudent, author: User): EmbedBuilder {
    const stats = BaService.getStudentStats(student);
    return new EmbedBuilder()
      .setColor(C.BULLET_COLOR[student.BulletType])
      .setTitle(`[${'★'.repeat(student.StarGrade)}] ${student.Name}'s stats`)
      .setURL(C.SCHALE_STUDENT_URL + student.PathName)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(
        `[${student.Id}] ${student.FamilyName} ${student.PersonalName}`,
      )
      .setThumbnail(C.SCHALE_STUDENT_ICON_URL(student.Id))
      .addFields(
        {
          name: 'Base main stats',
          value: `\`\`\`HP   : ${student.MaxHP1} / ${stats.MaxHP}\nATK  : ${student.AttackPower1} / ${stats.AttackPower}\nDEF  : ${student.DefensePower1} / ${stats.DefensePower}\nHEAL : ${student.HealPower1} / ${stats.HealPower}\`\`\``,
        },
        {
          name: 'Base sub stats',
          value: `\`\`\`RANGE  : ${student.Range}\nSTABLE : ${student.StabilityPoint} (${BaService.stabilityRate(student.StabilityPoint)}%)\nACC    : ${student.AccuracyPoint}\nEVA    : ${student.DodgePoint}\nCRIT.R : ${student.CriticalPoint}\nCRIT.D : ${BaService.criticalRate(student.CriticalDamageRate)}%\nREC    : ${student.RegenCost}\nCC.P   : ${C.CC_POWER}\nCC.R   : ${C.CC_RESISTANCE}\nAMMO   : ${student.AmmoCount}(${student.AmmoCost})\`\`\``,
        },
      )
      .setTimestamp()
      .setFooter({ text: 'SCHALE.gg', iconURL: C.SCHALE_GG_LOGO });
  }

  async studentSkills(student: IStudent, author: User): Promise<EmbedBuilder> {
    const loc = await this.getLocalization();
    const fields: APIEmbedField[] = [];
    const skillOrder = ['ex', 'normal', 'passive', 'sub'];
    const skills = student.Skills.filter((s: Skill) =>
      skillOrder.includes(s.SkillType),
    )
      .map((s: Skill) => BaService.transformStudentSkillStat(s, loc))
      .sort(
        (a: Skill, b: Skill) =>
          skillOrder.indexOf(a.SkillType) - skillOrder.indexOf(b.SkillType),
      );

    skills.forEach((skill: Skill) => {
      let title = `[${C.SKILL_MAP[skill.SkillType]}] ${skill.Name}`;
      const skillSummons = student.Summons.filter(
        (s) => s.SourceSkill === skill.SkillType,
      );
      const summonFields: APIEmbedField[] = [];
      skillSummons.forEach((summon) => {
        summon.Info?.Skills.filter(
          (ss: any) => ss.SkillType !== 'passive',
        ).forEach((ss: any) => {
          if (ss.SkillType === 'autoattack') {
            const attack = ss.Effects?.shift();
            const scale = attack?.Scale?.shift();
            const hits = attack?.Hits;
            skill.Desc += `\n\n[${summon.Info?.Name}]: Attack deals ${(scale ?? 0) / 100}% damage (${average(hits ?? []) / 100}% x ${hits?.length ?? 0} hits).`;
          } else {
            const t = BaService.transformStudentSkillStat(ss, loc);
            summonFields.push({
              name: `[${C.SKILL_MAP[summon.SourceSkill]}] [${summon.Info?.Name}] ${t.Name}`,
              value: `\`\`\`${t.Desc}\`\`\``,
            });
          }
        });
      });
      if (skill.SkillType === 'ex')
        title += ` \`(COST: ${skill.Cost?.join('->')})\``;
      fields.push({ name: title, value: `\`\`\`${skill.Desc}\`\`\`` });
      fields.push(...summonFields);
      if (skill.ExtraSkills?.length) {
        skill.ExtraSkills.forEach((es) => {
          const d = BaService.transformStudentSkillStat(es, loc);
          let n = `[${C.SKILL_MAP[es.SkillType]}] ${d.Name}`;
          if (es.TSAId) n += ` \`(TSA: ${es.TSAName})\``;
          fields.push({ name: n, value: `\`\`\`${d.Desc}\`\`\`` });
        });
      }
    });

    return new EmbedBuilder()
      .setColor(C.BULLET_COLOR[student.BulletType])
      .setTitle(`[${'★'.repeat(student.StarGrade)}] ${student.Name}'s skills`)
      .setURL(C.SCHALE_STUDENT_URL + student.PathName)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(
        `[${student.Id}] ${student.FamilyName} ${student.PersonalName}`,
      )
      .setThumbnail(C.SCHALE_STUDENT_ICON_URL(student.Id))
      .addFields(fields)
      .setTimestamp()
      .setFooter({ text: 'SCHALE.gg', iconURL: C.SCHALE_GG_LOGO });
  }

  async studentWeapon(student: IStudent, author: User): Promise<EmbedBuilder> {
    const loc = await this.getLocalization();
    const passiveSkill = BaService.transformStudentSkillStat(
      student.Skills.find((s: Skill) => s.SkillType === 'weaponpassive')!,
      loc,
    );
    const ws = BaService.getWeaponStats(student);
    return new EmbedBuilder()
      .setColor(C.BULLET_COLOR[student.BulletType])
      .setTitle(`[${'★'.repeat(student.StarGrade)}] ${student.Name}'s weapon`)
      .setURL(C.SCHALE_STUDENT_URL + student.PathName)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(
        `[${student.Id}] ${student.FamilyName} ${student.PersonalName}`,
      )
      .setThumbnail(C.SCHALE_STUDENT_ICON_URL(student.Id))
      .addFields(
        {
          name: 'Name',
          value: `\`\`\`[${student.WeaponType}] ${student.Weapon.Name}\`\`\``,
        },
        {
          name: `[Skill upgrade] ${passiveSkill.Name}`,
          value: `\`\`\`${passiveSkill.Desc}\`\`\``,
        },
        {
          name: 'Stats',
          value: `\`\`\`HP   : ${student.Weapon.MaxHP1} / ${ws.MaxHP}\nATK  : ${student.Weapon.AttackPower1} / ${ws.AttackPower}\nHEAL : ${student.Weapon.HealPower1} / ${ws.HealPower}\`\`\``,
        },
      )
      .setImage(C.SCHALE_STUDENT_WEAPON_URL(student.WeaponImg))
      .setTimestamp()
      .setFooter({ text: 'SCHALE.gg', iconURL: C.SCHALE_GG_LOGO });
  }

  async studentGear(student: IStudent, author: User): Promise<EmbedBuilder> {
    const loc = await this.getLocalization();
    const normalSkill = BaService.transformStudentSkillStat(
      student.Skills.find((s: Skill) => s.SkillType === 'gearnormal')!,
      loc,
    );
    return new EmbedBuilder()
      .setColor(C.BULLET_COLOR[student.BulletType])
      .setTitle(
        `[${'★'.repeat(student.StarGrade)}] ${student.Name}'s gear \`${student.Gear.Released?.[1] ? 'Global' : 'JP only'}\``,
      )
      .setURL(C.SCHALE_STUDENT_URL + student.PathName)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(
        `[${student.Id}] ${student.FamilyName} ${student.PersonalName}`,
      )
      .setThumbnail(C.SCHALE_STUDENT_ICON_URL(student.Id))
      .addFields(
        { name: 'Name', value: `\`\`\`${student.Gear.Name!}\`\`\`` },
        {
          name: `[Skill upgrade] ${normalSkill.Name}`,
          value: `\`\`\`${normalSkill.Desc}\`\`\``,
        },
        {
          name: 'Stats upgrade',
          value: `\`\`\`${Array(student.Gear.StatValue![0].length)
            .fill(0)
            .map(
              (_, tier) =>
                `T${tier + 1}: ${student.Gear.StatType!.map(
                  (stat, si) =>
                    `${student.Gear.StatValue![si][tier]} ${loc?.Stat[stat.replace('_Base', '')]}`,
                ).join(', ')}`,
            )
            .join('\n')}\`\`\``,
        },
      )
      .setImage(C.SCHALE_STUDENT_GEAR_URL(student.Id))
      .setTimestamp()
      .setFooter({ text: 'SCHALE.gg', iconURL: C.SCHALE_GG_LOGO });
  }

  async raid(
    raid: IRaid,
    difficulty: string,
    author: User,
  ): Promise<EmbedBuilder> {
    const loc = await this.getLocalization();
    const diffIdx = C.RAID_DIFFICULTIES[difficulty];
    const skills = raid.RaidSkill.filter(
      (s: RaidSkill) =>
        s.SkillType !== 'raidautoattack' && diffIdx >= (s.MinDifficulty ?? 0),
    ).map((s: RaidSkill) => BaService.transformRaidSkillStat(s, diffIdx, loc));

    const fields: APIEmbedField[] = [
      {
        name: 'Bullet type',
        value:
          diffIdx >= 5
            ? (loc?.BulletType[raid.BulletTypeInsane] ?? raid.BulletTypeInsane)
            : (loc?.BulletType[raid.BulletType] ?? raid.BulletType),
        inline: true,
      },
      {
        name: 'Armor type',
        value: loc?.ArmorType[raid.ArmorType] ?? raid.ArmorType,
        inline: true,
      },
      {
        name: 'Terrain',
        value: raid.Terrain.map((t: any) => `\`${t}\``).join(' '),
        inline: true,
      },
    ];

    if ((raid.BossList?.length ?? 0) > 0) {
      (raid.BossList![diffIdx] ?? []).forEach((boss: IEnemy) => {
        const pickedStats = {
          MaxHP100: boss.MaxHP100,
          AttackPower100: boss.AttackPower100,
          DefensePower100: boss.DefensePower100,
          DamagedRatio: boss.DamagedRatio,
          AccuracyPoint: boss.AccuracyPoint,
          DodgePoint: boss.DodgePoint,
          CriticalPoint: boss.CriticalPoint,
          StabilityPoint: boss.StabilityPoint,
          Range: boss.Range,
          GroggyGauge: boss.GroggyGauge,
          GroggyTime: boss.GroggyTime,
        };
        const stats = Object.entries(pickedStats).map(
          ([k, v]) => `${loc?.Stat[k.replace(/[0-9]/g, '')] ?? k}: ${v}`,
        );
        fields.push({
          name: `[Stats] Lv.${C.RAID_LEVEL[diffIdx]} ${boss.Name}`,
          value: `\`\`\`${stats.join('\n')}\`\`\``,
        });
        if ((boss.PhaseChange?.length ?? 0) > 0) {
          fields.push({
            name: `[Phases] Lv.${C.RAID_LEVEL[diffIdx]} ${boss.Name}`,
            value: `\`\`\`Begins phase 1 with ${boss.MaxHP100} HP.\n${boss
              .PhaseChange!.map((p: any) =>
                formatString(loc?.RaidChangePhase[p.Trigger] ?? '', [
                  p.Phase + 1,
                  p.Argument,
                ]),
              )
              .join('\n')}\`\`\``,
          });
        }
      });
    }

    skills.forEach((s: RaidSkill) =>
      fields.push({ name: s.Name!, value: `\`\`\`${s.Desc!}\`\`\`` }),
    );
    fields.push({ name: 'Profile', value: `\`\`\`${raid.Profile}\`\`\`` });

    return new EmbedBuilder()
      .setColor(C.ARMOR_COLOR[raid.ArmorType])
      .setTitle(`[${raid.Faction}] ${raid.Name} - \`${difficulty}\``)
      .setURL(C.SCHALE_RAID_URL + raid.Id)
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
      .setDescription(
        `${C.BOOLEAN_MAP[(raid.MaxDifficulty[0] >= diffIdx).toString()]} JP ー ${C.BOOLEAN_MAP[(raid.MaxDifficulty[1] >= diffIdx && raid.IsReleased[1]).toString()]} GLOBAL ー ${C.BOOLEAN_MAP[(raid.MaxDifficulty[2] >= diffIdx && raid.IsReleased[2]).toString()]} CN`,
      )
      .setThumbnail(C.SCHALE_RAID_ICON_URL(raid.PathName, diffIdx >= 5))
      .addFields(fields)
      .setImage(C.SCHALE_RAID_PORTRAIT_URL(raid.PathName, diffIdx >= 5))
      .setTimestamp()
      .setFooter({ text: 'SCHALE.gg', iconURL: C.SCHALE_GG_LOGO });
  }
}
