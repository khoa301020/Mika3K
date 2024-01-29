import type { APIEmbedField, User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { decode } from 'html-entities';
import { BlueArchiveConstants, CommonConstants } from '../../constants/index.js';
import { cache } from '../../main.js';
import { SchaleMath, getData, transformRaidSkillStat, transformStudentSkillStat } from '../../services/bluearchive.js';
import { CurrentEvent, CurrentGacha, CurrentRaid, Region } from '../../types/bluearchive/config.js';
import { IEnemy } from '../../types/bluearchive/enemy.js';
import { IFurniture } from '../../types/bluearchive/furniture.js';
import { ILocalization } from '../../types/bluearchive/localization.js';
import { IRaid, RaidSkill } from '../../types/bluearchive/raid.js';
import { Equipment, IStudent, Skill } from '../../types/bluearchive/student.js';
import { average, convertTZ, datetimeConverter, formatString, getRelativeTimeBA, isEnded } from '../../utils/index.js';

/* Server embed */

export const BA_ServerEmbed = (region: Region, author: User, timezoneOffset: number = 0): EmbedBuilder => {
  const localization: ILocalization | undefined = cache.get('BA_Localization');
  const raids: Array<CurrentRaid & { info?: any }> = region.CurrentRaid.filter(
    (region) => region.raid.toString().length < 4 && !isEnded(region.end),
  );
  const timeAttacks: Array<CurrentRaid & { info?: any }> = region.CurrentRaid.filter(
    (region) => region.raid.toString().length >= 4 && !isEnded(region.end),
  );
  region.CurrentGacha = region.CurrentGacha.filter((gacha: CurrentGacha) => !isEnded(gacha.end));
  region.CurrentEvents = region.CurrentEvents.filter((event: CurrentEvent) => !isEnded(event.end));

  const today = new Date();
  const todayJP = datetimeConverter(convertTZ(today, 'Asia/Tokyo')).studentBirthday;
  const tomorrowJP = datetimeConverter(
    convertTZ(new Date(today.setDate(today.getDate() + 1)), 'Asia/Tokyo'),
  ).studentBirthday;
  const fields: Array<APIEmbedField> = [
    { name: 'No. students', value: `${region.studentsCount!}`, inline: true },
    { name: 'No. raids', value: `${region.raidsCount!}`, inline: true },
    { name: 'No. events', value: `${region.eventsCount} (${region.rerunEventsCount})`, inline: true },
    { name: 'Student', value: `Level ${region.StudentMaxLevel}`, inline: true },
    { name: 'Weapon', value: `Level ${region.WeaponMaxLevel}`, inline: true },
    { name: 'Bond', value: `Level ${region.BondMaxLevel}`, inline: true },
    { name: 'Gear', value: `Tier ${region.EquipmentMaxLevel.join('/')}`, inline: true },
    { name: 'Mission', value: `Area ${region.CampaignMax}`, inline: true },
    { name: 'Bounty', value: `Stage ${region.ChaserMax}`, inline: true },
    { name: 'Scrimmage', value: `Stage ${region.SchoolDungeonMax}`, inline: true },
    { name: 'Commission', value: `Stage ${region.BloodMax}`, inline: true },
    {
      name: 'Decagrammaton',
      value: `Stage ${region.Event701Max[0]} (${region.Event701Max[1]} - ${region.Event701Max[2]})`,
      inline: true,
    },
  ];
  region.CurrentGacha.length > 0 &&
    fields.push({
      name: 'Current banner',
      value: `${region.CurrentGacha.map(
        (currentGacha: CurrentGacha) =>
          `• *${getRelativeTimeBA(currentGacha.start, currentGacha.end)}* \nㅤ- ${currentGacha.characters
            .map((character: any) => `[${`★`.repeat(character.StarGrade)}] ${character.Name}`)
            .join('\nㅤ- ')} `,
      ).join('\n')}`,
    });
  region.incomingBirthdayStudents &&
    region.incomingBirthdayStudents.length > 0 &&
    fields.push({
      name: "Upcoming student's birthday",
      value: `${region.incomingBirthdayStudents
        .map(
          (student: IStudent) =>
            `ㅤ- [${student.Birthday}] ${student.Name} ${student.BirthDay === todayJP ? 'ー **TODAY!**' : student.BirthDay === tomorrowJP ? 'ー **TOMORROW!**' : ''
            }`,
        )
        .join('\n')}`,
    });

  region.CurrentEvents.length > 0 &&
    fields.push({
      name: 'Current & upcoming events',
      value: `${region.CurrentEvents.map(
        (currentEvent: CurrentEvent) =>
          `- ${!/^10/.test(currentEvent.event.toString())
            ? localization?.EventName[currentEvent.event.toString()]
            : `[Rerun] ${localization?.EventName[currentEvent.event.toString().slice(2)]}`
          } *(${getRelativeTimeBA(currentEvent.start, currentEvent.end)})*`,
      ).join('\n')}`,
    });
  raids.length > 0 &&
    fields.push({
      name: 'Current & upcoming raids',
      value: `${raids
        .map(
          (currentRaid: CurrentRaid & { info?: any }) =>
            `- [${localization?.AdaptationType[currentRaid.terrain!]}] ${currentRaid.info.Name} *(${getRelativeTimeBA(
              currentRaid.start,
              currentRaid.end,
            )})*`,
        )
        .join('\n')}`,
    });
  timeAttacks.length > 0 &&
    fields.push({
      name: 'Current & upcoming drills',
      value: `${timeAttacks
        .map(
          (currentRaid: CurrentRaid & { info?: any }) =>
            `- [${localization?.AdaptationType[currentRaid.info.Terrain]}] ${currentRaid.info.DungeonType
            } *(${getRelativeTimeBA(currentRaid.start, currentRaid.end)})*`,
        )
        .join('\n')}`,
    });

  return (
    new EmbedBuilder()
      .setColor(CommonConstants.DEFAULT_EMBED_COLOR)
      .setTitle(`${region.Name.toUpperCase()} server's status`)
      .setAuthor({
        name: `${author.username}#${author.discriminator}`,
        iconURL: author.displayAvatarURL(),
      })
      // .setDescription('')
      .setThumbnail(BlueArchiveConstants.SCHALE_GG_ARONA)
      .addFields(fields)
      .setTimestamp()
      .setFooter({
        text: `SCHALE.gg`,
        iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
      })
  );
};

/* Student embeds */

export const BA_StudentEmbed = (student: IStudent, author: User, page?: number, total?: number): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(BlueArchiveConstants.BULLET_COLOR[student.BulletType])
    .setTitle(`[${'★'.repeat(student.StarGrade)}] ${student.Name}`)
    .setURL(BlueArchiveConstants.SCHALE_STUDENT_URL + student.PathName)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`[${student.Id}] ${student.FamilyName} ${student.PersonalName}`)
    .setThumbnail(BlueArchiveConstants.STUDENT_SCHOOL_LOGO[student.School])
    .addFields(
      {
        name: 'Release status',
        value: `${student.IsReleased[1] ? 'Global' : 'JP only'} (${BlueArchiveConstants.STUDENT_TYPE[student.IsLimited]
          })`,
        inline: true,
      },
      {
        name: 'Illustrator/Designer',
        value: `${student.Illustrator}${student.Illustrator !== student.Designer ? `/${student.Designer}` : ''}`,
        inline: true,
      },
      { name: 'Seiyuu', value: student.CharacterVoice, inline: true },
      { name: 'Birthday', value: student.Birthday, inline: true },
      { name: 'Age', value: student.CharacterAge, inline: true },
      { name: 'Height', value: student.CharHeightMetric, inline: true },
      { name: 'School', value: student.SchoolLong!, inline: true },
      { name: 'School year', value: student.SchoolYear.length > 0 ? student.SchoolYear : 'N/A', inline: true },
      { name: 'Club', value: student.Club, inline: true },
      { name: 'Squad type ', value: student.SquadType, inline: true },
      { name: 'Position', value: student.Position, inline: true },
      {
        name: 'Tactic role',
        value: student.TacticRoleLong ? student.TacticRoleLong : student.TacticRole,
        inline: true,
      },
      { name: 'Armor type', value: student.ArmorType, inline: true },
      {
        name: 'Equipment',
        value: student.Equipment.map((equipment: Equipment) => BlueArchiveConstants.EQUIPMENT_TYPES[equipment]).join(
          '/',
        ),
        inline: true,
      },
      { name: 'Use cover', value: student.Cover ? 'Yes' : 'No', inline: true },
      {
        name: 'Adaptation',
        value: `\`\`\`Urban: ${BlueArchiveConstants.ADAPTATION_ICON[student.StreetBattleAdaptation]}, Indoor: ${BlueArchiveConstants.ADAPTATION_ICON[student.IndoorBattleAdaptation]
          }, Outdoor: ${BlueArchiveConstants.ADAPTATION_ICON[student.OutdoorBattleAdaptation]}\`\`\``,
      },
      { name: 'Introduction', value: `\`\`\`${decode(student.ProfileIntroduction)}\`\`\`` },
    )
    .setImage(BlueArchiveConstants.SCHALE_STUDENT_PORTRAIT_URL(student.Id))
    .setTimestamp()
    .setFooter({
      text: `SCHALE.gg ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
      iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
    });
};
export const BA_StudentProfileEmbed = (
  student: IStudent,
  author: User,
  furnitures: Array<IFurniture>,
): EmbedBuilder => {
  const localization: ILocalization | undefined = cache.get('BA_Localization');

  return new EmbedBuilder()
    .setColor(BlueArchiveConstants.BULLET_COLOR[student.BulletType])
    .setTitle(`[${'★'.repeat(student.StarGrade)}] ${student.Name}'s profile`)
    .setURL(BlueArchiveConstants.SCHALE_STUDENT_URL + student.PathName)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`[${student.Id}] ${student.FamilyName} ${student.PersonalName}`)
    .setThumbnail(BlueArchiveConstants.SCHALE_STUDENT_ICON_URL(student.Id))
    .addFields(
      { name: 'Hobbies', value: `\`\`\`${student.Hobby}\`\`\`` },
      {
        name: 'Favorite item tags',
        value: `\`\`\`${student.FavorItemTags.length > 0 ? student.FavorItemTags.join(', ') : 'N/A'}\`\`\``,
      },
      {
        name: 'Furniture interaction',
        value: `\`\`\`${furnitures?.length > 0
          ? furnitures.map((furniture: IFurniture) => `[${furniture.Rarity}] ${furniture.Name}`).join('\n')
          : 'N/A'
          }\`\`\``,
      },
      {
        name: 'Relationship rank bonus',
        value: `\`\`\`${[10, 20, 30, 40, 50]
          .map((level: number) => {
            const stats = SchaleMath.getBondStats(student, level);
            return `Rank ${level}: ${Object.keys(stats)
              .map((key: string) => `${stats[key]} ${localization!.Stat[key]}`)
              .join(', ')}`;
          })
          .join('\n')}\`\`\``,
      },
      {
        name: `Recollection lobby (BGM: ${student.MemoryLobbyBGM})`,
        value: `Unlocks after reaching relationship **rank ${student.MemoryLobby[0]}** with **${student.Name}**.`,
      },
    )
    .setImage(BlueArchiveConstants.SCHALE_STUDENT_LOBBY_URL(student.Id))
    .setTimestamp()
    .setFooter({
      text: `SCHALE.gg`,
      iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
    });
};
export const BA_StudentStatsEmbed = (student: IStudent, author: User): EmbedBuilder => {
  const studentStats = SchaleMath.getStudentStats(student);

  return new EmbedBuilder()
    .setColor(BlueArchiveConstants.BULLET_COLOR[student.BulletType])
    .setTitle(`[${'★'.repeat(student.StarGrade)}] ${student.Name}'s stats`)
    .setURL(BlueArchiveConstants.SCHALE_STUDENT_URL + student.PathName)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`[${student.Id}] ${student.FamilyName} ${student.PersonalName}`)
    .setThumbnail(BlueArchiveConstants.SCHALE_STUDENT_ICON_URL(student.Id))
    .addFields(
      {
        name: 'Base main stats',
        value: `\`\`\`HP   : ${student.MaxHP1} / ${studentStats.MaxHP}\nATK  : ${student.AttackPower1} / ${studentStats.AttackPower}\nDEF  : ${student.DefensePower1} / ${studentStats.DefensePower}\nHEAL : ${student.HealPower1} / ${studentStats.HealPower}\`\`\``,
      },
      {
        name: 'Base sub stats',
        value: `\`\`\`RANGE  : ${student.Range}\nSTABLE : ${student.StabilityPoint} (${SchaleMath.stabilityRate(
          student.StabilityPoint,
        )}%)\nACC    : ${student.AccuracyPoint}\nEVA    : ${student.DodgePoint}\nCRIT.R : ${student.CriticalPoint
          }\nCRIT.D : ${SchaleMath.criticalRate(student.CriticalDamageRate)}%\nREC    : ${student.RegenCost}\nCC.P   : ${BlueArchiveConstants.CC_POWER
          }\nCC.R   : ${BlueArchiveConstants.CC_RESISTANCE}\nAMMO   : ${student.AmmoCount}(${student.AmmoCost})\`\`\``,
      },
    )
    .setTimestamp()
    .setFooter({
      text: `SCHALE.gg`,
      iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
    });
};
export const BA_StudentSkillsEmbed = (student: IStudent, author: User): EmbedBuilder => {
  const localization: ILocalization | undefined = cache.get('BA_Localization');
  const fields: Array<APIEmbedField> = [];

  const skillOrder = ['ex', 'normal', 'passive', 'sub'];
  const skills = student.Skills.filter((skill: Skill) =>
    ['ex', 'normal', 'passive', 'sub'].includes(skill.SkillType),
  ).map((skill: Skill) => transformStudentSkillStat(skill, localization));
  // sort skill in order ['ex', 'normal', 'passive', 'sub']
  skills.sort((a: Skill, b: Skill) => skillOrder.indexOf(a.SkillType) - skillOrder.indexOf(b.SkillType));
  skills.forEach(async (skill: Skill) => {
    let title = `[${BlueArchiveConstants.SKILL_MAP[skill.SkillType]}] ${skill.Name}`;

    const skillSummons = student.Summons.filter((summon) => summon.SourceSkill === skill.SkillType);
    const summonSkills: Array<APIEmbedField> = [];
    if (skillSummons.length > 0) {
      skillSummons.forEach((summon) => {
        summon
          .Info!.Skills.filter((summonSkill) => summonSkill.SkillType !== 'passive')
          .forEach((summonSkill) => {
            if (summonSkill.SkillType === 'autoattack') {
              const attack = summonSkill.Effects.shift();
              const scale = attack?.Scale.shift();
              const hits = attack?.Hits;
              skill.Desc += `\n\n[${summon.Info?.Name}]: Attack deals ${scale! / 100}% damage (${average(hits!) / 100
                }% x ${hits?.length!} hits).`;
            } else {
              const transformedSummonSkill = transformStudentSkillStat(summonSkill, localization);
              summonSkills.push({
                name: `[${BlueArchiveConstants.SKILL_MAP[summon.SourceSkill]}] [${summon.Info?.Name}] ${transformedSummonSkill.Name
                  }`,
                value: `\`\`\`${transformedSummonSkill.Desc}\`\`\``,
              });
            }
          });
      });
    }

    if (skill.SkillType === 'ex') title += ` \`(COST: ${skill.Cost?.join('->')})\``;
    fields.push({
      name: title,
      value: `\`\`\`${skill.Desc}\`\`\``,
    });
    fields.push(...summonSkills);

    if (skill.ExtraSkills?.length) {
      skill.ExtraSkills.forEach((extraSkill) => {
        const extraSkillDesc = transformStudentSkillStat(extraSkill, localization);
        let skillName = `[${BlueArchiveConstants.SKILL_MAP[extraSkill.SkillType]}] ${extraSkillDesc.Name}`;
        if (extraSkill.TSAId) skillName += ` \`(TSA: ${extraSkill.TSAName})\``;
        fields.push({
          name: skillName,
          value: `\`\`\`${extraSkillDesc.Desc}\`\`\``,
        });
      });
    }
  });

  return new EmbedBuilder()
    .setColor(BlueArchiveConstants.BULLET_COLOR[student.BulletType])
    .setTitle(`[${'★'.repeat(student.StarGrade)}] ${student.Name}'s stats`)
    .setURL(BlueArchiveConstants.SCHALE_STUDENT_URL + student.PathName)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`[${student.Id}] ${student.FamilyName} ${student.PersonalName}`)
    .setThumbnail(BlueArchiveConstants.SCHALE_STUDENT_ICON_URL(student.Id))
    .addFields(fields)
    .setTimestamp()
    .setFooter({
      text: `SCHALE.gg`,
      iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
    });
};
export const BA_StudentWeaponEmbed = (student: IStudent, author: User): EmbedBuilder => {
  const localization: ILocalization | undefined = cache.get('BA_Localization');
  const passiveSkillUpgrade: Skill = transformStudentSkillStat(
    student.Skills.find((skill: Skill) => skill.SkillType === 'weaponpassive')!,
    localization,
  );
  const weaponStats = SchaleMath.getWeaponStats(student);

  return new EmbedBuilder()
    .setColor(BlueArchiveConstants.BULLET_COLOR[student.BulletType])
    .setTitle(`[${'★'.repeat(student.StarGrade)}] ${student.Name}'s weapon`)
    .setURL(BlueArchiveConstants.SCHALE_STUDENT_URL + student.PathName)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`[${student.Id}] ${student.FamilyName} ${student.PersonalName}`)
    .setThumbnail(BlueArchiveConstants.SCHALE_STUDENT_ICON_URL(student.Id))
    .addFields(
      { name: 'Name', value: `\`\`\`[${student.WeaponType}] ${student.Weapon.Name}\`\`\`` },
      { name: `[Skill upgrade] ${passiveSkillUpgrade.Name}`, value: `\`\`\`${passiveSkillUpgrade.Desc}\`\`\`` },
      {
        name: `[Adaptation upgrade] ${student.Weapon.AdaptationType}`,
        value: `\`\`\`Urban   : ${BlueArchiveConstants.ADAPTATION_ICON[student.StreetBattleAdaptation]}${student.Weapon.AdaptationType === 'Street'
          ? ` -> ${BlueArchiveConstants.ADAPTATION_ICON[student.StreetBattleAdaptation + student.Weapon.AdaptationValue]
          }`
          : ''
          }\nIndoor  : ${BlueArchiveConstants.ADAPTATION_ICON[student.IndoorBattleAdaptation]}${student.Weapon.AdaptationType === 'Indoor'
            ? ` -> ${BlueArchiveConstants.ADAPTATION_ICON[student.IndoorBattleAdaptation + student.Weapon.AdaptationValue]
            }`
            : ''
          }\nOutdoor : ${BlueArchiveConstants.ADAPTATION_ICON[student.OutdoorBattleAdaptation]}${student.Weapon.AdaptationType === 'Outdoor'
            ? ` -> ${BlueArchiveConstants.ADAPTATION_ICON[student.OutdoorBattleAdaptation + student.Weapon.AdaptationValue]
            }`
            : ''
          }\`\`\``,
      },
      {
        name: 'Stats',
        value: `\`\`\`HP   : ${student.Weapon.MaxHP1} / ${weaponStats.MaxHP}\nATK  : ${student.Weapon.AttackPower1} / ${weaponStats.AttackPower}\nHEAL : ${student.Weapon.HealPower1} / ${weaponStats.HealPower}\`\`\``,
      },
    )
    .setImage(BlueArchiveConstants.SCHALE_STUDENT_WEAPON_URL(student.WeaponImg))
    .setTimestamp()
    .setFooter({
      text: `SCHALE.gg`,
      iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
    });
};
export const BA_StudentGearEmbed = (student: IStudent, author: User): EmbedBuilder => {
  const localization: ILocalization | undefined = cache.get('BA_Localization');
  const normalSkillUpgrade: Skill = transformStudentSkillStat(
    student.Skills.find((skill: Skill) => skill.SkillType === 'gearnormal')!,
    localization,
  );

  return new EmbedBuilder()
    .setColor(BlueArchiveConstants.BULLET_COLOR[student.BulletType])
    .setTitle(
      `[${'★'.repeat(student.StarGrade)}] ${student.Name}'s gear \`${student.Gear.Released![1] ? 'Global' : 'JP only'
      }\``,
    )
    .setURL(BlueArchiveConstants.SCHALE_STUDENT_URL + student.PathName)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`[${student.Id}] ${student.FamilyName} ${student.PersonalName}`)
    .setThumbnail(BlueArchiveConstants.SCHALE_STUDENT_ICON_URL(student.Id))
    .addFields(
      { name: 'Name', value: `\`\`\`${student.Gear.Name!}\`\`\`` },
      { name: 'Description', value: `\`\`\`${student.Gear.Desc!}\`\`\`` },
      { name: `[Skill upgrade] ${normalSkillUpgrade.Name}`, value: `\`\`\`${normalSkillUpgrade.Desc}\`\`\`` },
      {
        name: `Stats upgrade`,
        value: `\`\`\`${Array(student.Gear.StatValue![0].length)
          .fill(0)
          .map(
            (_, tier) =>
              `T${tier + 1}: ${student.Gear.StatType!.map(
                (stat, statIndex) =>
                  `${student.Gear.StatValue![statIndex][tier]} ${localization?.Stat[stat.replace('_Base', '')]}`,
              ).join(', ')}`,
          )
          .join('\n')}\`\`\``,
      },
    )
    .setImage(BlueArchiveConstants.SCHALE_STUDENT_GEAR_URL(student.Id))
    .setTimestamp()
    .setFooter({
      text: `SCHALE.gg`,
      iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
    });
};

/* Raid embed */

export const BA_RaidEmbed = (raid: IRaid, difficulty: string, author: User): EmbedBuilder => {
  const localization: ILocalization | undefined = cache.get('BA_Localization');

  let skills: Array<RaidSkill> = raid.RaidSkill.filter(
    (raidSkill: RaidSkill) =>
      raidSkill.SkillType !== 'raidautoattack' &&
      BlueArchiveConstants.RAID_DIFFICULTIES[difficulty] >= raidSkill.MinDifficulty!,
  );

  skills = skills.map((skill: RaidSkill) =>
    transformRaidSkillStat(skill, BlueArchiveConstants.RAID_DIFFICULTIES[difficulty], localization),
  );

  let fields: Array<APIEmbedField> = [
    {
      name: 'Bullet type',
      value:
        BlueArchiveConstants.RAID_DIFFICULTIES[difficulty] >= 5
          ? localization!.BulletType[raid.BulletTypeInsane]
          : localization!.BulletType[raid.BulletType],
      inline: true,
    },
    { name: 'Armor type', value: localization ? localization.ArmorType[raid.ArmorType] : raid.ArmorType, inline: true },
    { name: 'Terrain', value: raid.Terrain.join(', '), inline: true },
  ];

  // Extract bosses stats
  if (raid.BossList && raid.BossList.length > 0)
    raid.BossList[BlueArchiveConstants.RAID_DIFFICULTIES[difficulty]].forEach((boss: IEnemy) => {
      const pickedStats = (({
        MaxHP100,
        AttackPower100,
        DefensePower100,
        DamagedRatio,
        AccuracyPoint,
        DodgePoint,
        CriticalPoint,
        CriticalResistPoint,
        CriticalDamageRate,
        CriticalDamageResistRate,
        StabilityPoint,
        Range,
        GroggyGauge,
        GroggyTime,
      }) => ({
        MaxHP100,
        AttackPower100,
        DefensePower100,
        DamagedRatio,
        AccuracyPoint,
        DodgePoint,
        CriticalPoint,
        CriticalResistPoint,
        CriticalDamageRate,
        CriticalDamageResistRate,
        StabilityPoint,
        Range,
        GroggyGauge,
        GroggyTime,
      }))(boss);
      const stats = Object.entries(pickedStats).map(
        ([key, value]) =>
          `${localization!.Stat[key === 'CriticalResistPoint' ? 'CriticalChanceResistPoint' : key.replace(/[0-9]/g, '')]
          }: ${value}`,
      );
      fields.push({
        name: `[Stats] Lv.${BlueArchiveConstants.RAID_LEVEL[BlueArchiveConstants.RAID_DIFFICULTIES[difficulty]]} ${boss.Name
          }`,
        value: `\`\`\`${stats.join('\n')}\`\`\``,
      });
      if (boss.PhaseChange && boss.PhaseChange.length > 0) {
        const title = `[Phases] Lv.${BlueArchiveConstants.RAID_LEVEL[BlueArchiveConstants.RAID_DIFFICULTIES[difficulty]]} ${boss.Name}`;
        const desc = `Begins phase 1 with ${boss.MaxHP100} HP.\n` +
          boss.PhaseChange.map((phase) => formatString(localization?.RaidChangePhase[phase.Trigger]!, [phase.Phase + 1, phase.Argument])).join('\n');
        fields.push({
          name: title,
          value: `\`\`\`${desc}\`\`\``,
        });
      }
    });

  skills.forEach((skill: RaidSkill) => {
    fields.push({ name: skill.Name!, value: `\`\`\`${skill.Desc!}\`\`\`` });
  });

  fields.push({ name: 'Profile', value: `\`\`\`${raid.Profile}\`\`\`` });

  return new EmbedBuilder()
    .setColor(BlueArchiveConstants.ARMOR_COLOR[raid.ArmorType])
    .setTitle(`[${raid.Faction}] ${raid.Name} - \`${difficulty}\``)
    .setURL(BlueArchiveConstants.SCHALE_RAID_URL + raid.Id)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(
      `${CommonConstants.BOOLEAN_MAP[
      (raid.MaxDifficulty[0] >= BlueArchiveConstants.RAID_DIFFICULTIES[difficulty]).toString()
      ]
      } JP ー ${CommonConstants.BOOLEAN_MAP[
      (raid.MaxDifficulty[1] >= BlueArchiveConstants.RAID_DIFFICULTIES[difficulty] && raid.IsReleased[1]).toString()
      ]
      } GLOBAL ー ${CommonConstants.BOOLEAN_MAP[
      (raid.MaxDifficulty[2] >= BlueArchiveConstants.RAID_DIFFICULTIES[difficulty] && raid.IsReleased[2]).toString()
      ]
      } CN`,
    )
    .setThumbnail(
      BlueArchiveConstants.SCHALE_RAID_ICON_URL(raid.PathName, BlueArchiveConstants.RAID_DIFFICULTIES[difficulty] >= 5),
    )
    .addFields(fields)
    .setImage(
      BlueArchiveConstants.SCHALE_RAID_PORTRAIT_URL(
        raid.PathName,
        BlueArchiveConstants.RAID_DIFFICULTIES[difficulty] >= 5,
      ),
    )
    .setTimestamp()
    .setFooter({
      text: `SCHALE.gg`,
      iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
    });
};
