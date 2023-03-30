import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { decode } from 'html-entities';
import { BlueArchiveConstants } from '../../constants/index.js';
import { cache } from '../../main.js';
import { SchaleMath, transformSkillStat } from '../../services/bluearchive.js';
import { IFurniture } from '../../types/bluearchive/furniture.js';
import { ILocalization } from '../../types/bluearchive/localization.js';
import { Equipment, IStudent, Skill } from '../../types/bluearchive/student.js';

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
        value: `${student.IsReleased[1] ? 'Global' : 'JP only'} (${
          BlueArchiveConstants.STUDENT_TYPE[student.IsLimited]
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
        value: `\`\`\`Urban: ${BlueArchiveConstants.ADAPTATION_ICON[student.StreetBattleAdaptation]}, Indoor: ${
          BlueArchiveConstants.ADAPTATION_ICON[student.IndoorBattleAdaptation]
        }, Outdoor: ${BlueArchiveConstants.ADAPTATION_ICON[student.OutdoorBattleAdaptation]}\`\`\``,
      },
      { name: 'Introduction', value: `\`\`\`${decode(student.ProfileIntroduction)}\`\`\`` },
    )
    .setImage(BlueArchiveConstants.SCHALE_STUDENT_PORTRAIT_URL + 'Portrait_' + student.DevName + '.webp')
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
    .setThumbnail(BlueArchiveConstants.SCHALE_STUDENT_ICON_URL + student.CollectionTexture + '.png')
    .addFields(
      { name: 'Hobbies', value: `\`\`\`${student.Hobby}\`\`\`` },
      {
        name: 'Favorite item tags',
        value: `\`\`\`${student.FavorItemTags.length > 0 ? student.FavorItemTags.join(', ') : 'N/A'}\`\`\``,
      },
      {
        name: 'Furniture interaction',
        value: `\`\`\`${
          furnitures?.length > 0
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
    .setImage(BlueArchiveConstants.SCHALE_STUDENT_LOBBY_URL(student.DevName))
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
    .setThumbnail(BlueArchiveConstants.SCHALE_STUDENT_ICON_URL + student.CollectionTexture + '.png')
    .addFields(
      {
        name: 'Base main stats',
        value: `\`\`\`HP   : ${student.MaxHP1} / ${studentStats.MaxHP}\nATK  : ${student.AttackPower1} / ${studentStats.AttackPower}\nDEF  : ${student.DefensePower1} / ${studentStats.DefensePower}\nHEAL : ${student.HealPower1} / ${studentStats.HealPower}\`\`\``,
      },
      {
        name: 'Base sub stats',
        value: `\`\`\`RANGE  : ${student.Range}\nSTABLE : ${student.StabilityPoint} (${SchaleMath.stabilityRate(
          student.StabilityPoint,
        )}%)\nACC    : ${student.AccuracyPoint}\nEVA    : ${student.DodgePoint}\nCRIT.R : ${
          student.CriticalPoint
        }\nCRIT.D : ${SchaleMath.criticalRate(student.CriticalDamageRate)}%\nREC    : ${student.RegenCost}\nCC.P   : ${
          BlueArchiveConstants.CC_POWER
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

  const exSkill: Skill = transformSkillStat(
    student.Skills.find((skill: Skill) => skill.SkillType === 'ex')!,
    localization,
  );
  const normalSkill: Skill = transformSkillStat(
    student.Skills.find((skill: Skill) => skill.SkillType === 'normal')!,
    localization,
  );
  const passiveSkill: Skill = transformSkillStat(
    student.Skills.find((skill: Skill) => skill.SkillType === 'passive')!,
    localization,
  );
  const subSkill: Skill = transformSkillStat(
    student.Skills.find((skill: Skill) => skill.SkillType === 'sub')!,
    localization,
  );

  return new EmbedBuilder()
    .setColor(BlueArchiveConstants.BULLET_COLOR[student.BulletType])
    .setTitle(`[${'★'.repeat(student.StarGrade)}] ${student.Name}'s stats`)
    .setURL(BlueArchiveConstants.SCHALE_STUDENT_URL + student.PathName)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`[${student.Id}] ${student.FamilyName} ${student.PersonalName}`)
    .setThumbnail(BlueArchiveConstants.SCHALE_STUDENT_ICON_URL + student.CollectionTexture + '.png')
    .addFields(
      { name: `[EX] ${exSkill?.Name} \`(COST: ${exSkill?.Cost?.join('->')})\``, value: `\`\`\`${exSkill?.Desc}\`\`\`` },
      { name: `[Normal] ${normalSkill?.Name}`, value: `\`\`\`${normalSkill?.Desc}\`\`\`` },
      { name: `[Passive] ${passiveSkill?.Name}`, value: `\`\`\`${passiveSkill?.Desc}\`\`\`` },
      { name: `[Sub] ${subSkill?.Name}`, value: `\`\`\`${subSkill?.Desc}\`\`\`` },
    )
    .setTimestamp()
    .setFooter({
      text: `SCHALE.gg`,
      iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
    });
};
export const BA_StudentWeaponEmbed = (student: IStudent, author: User): EmbedBuilder => {
  const localization: ILocalization | undefined = cache.get('BA_Localization');
  const passiveSkillUpgrade: Skill = transformSkillStat(
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
    .setThumbnail(BlueArchiveConstants.SCHALE_STUDENT_ICON_URL + student.CollectionTexture + '.png')
    .addFields(
      { name: 'Name', value: `\`\`\`[${student.WeaponType}] ${student.Weapon.Name}\`\`\`` },
      { name: `[Skill upgrade] ${passiveSkillUpgrade.Name}`, value: `\`\`\`${passiveSkillUpgrade.Desc}\`\`\`` },
      {
        name: `[Adaptation upgrade] ${student.Weapon.AdaptationType}`,
        value: `\`\`\`Urban   : ${BlueArchiveConstants.ADAPTATION_ICON[student.StreetBattleAdaptation]}${
          student.Weapon.AdaptationType === 'Street'
            ? ` -> ${
                BlueArchiveConstants.ADAPTATION_ICON[student.StreetBattleAdaptation + student.Weapon.AdaptationValue]
              }`
            : ''
        }\nIndoor  : ${BlueArchiveConstants.ADAPTATION_ICON[student.IndoorBattleAdaptation]}${
          student.Weapon.AdaptationType === 'Indoor'
            ? ` -> ${
                BlueArchiveConstants.ADAPTATION_ICON[student.IndoorBattleAdaptation + student.Weapon.AdaptationValue]
              }`
            : ''
        }\nOutdoor : ${BlueArchiveConstants.ADAPTATION_ICON[student.OutdoorBattleAdaptation]}${
          student.Weapon.AdaptationType === 'Outdoor'
            ? ` -> ${
                BlueArchiveConstants.ADAPTATION_ICON[student.OutdoorBattleAdaptation + student.Weapon.AdaptationValue]
              }`
            : ''
        }\`\`\``,
      },
      {
        name: 'Stats',
        value: `\`\`\`HP   : ${student.Weapon.MaxHP1} / ${weaponStats.MaxHP}\nATK  : ${student.Weapon.AttackPower1} / ${weaponStats.AttackPower}\nHEAL : ${student.Weapon.HealPower1} / ${weaponStats.HealPower}\`\`\``,
      },
    )
    .setImage(BlueArchiveConstants.SCHALE_STUDENT_WEAPON_URL + student.WeaponImg + '.png')
    .setTimestamp()
    .setFooter({
      text: `SCHALE.gg`,
      iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
    });
};
export const BA_StudentGearEmbed = (student: IStudent, author: User): EmbedBuilder => {
  const localization: ILocalization | undefined = cache.get('BA_Localization');
  const normalSkillUpgrade: Skill = transformSkillStat(
    student.Skills.find((skill: Skill) => skill.SkillType === 'gearnormal')!,
    localization,
  );

  return new EmbedBuilder()
    .setColor(BlueArchiveConstants.BULLET_COLOR[student.BulletType])
    .setTitle(
      `[${'★'.repeat(student.StarGrade)}] ${student.Name}'s gear \`${
        student.Gear.Released![1] ? 'Global' : 'JP only'
      }\``,
    )
    .setURL(BlueArchiveConstants.SCHALE_STUDENT_URL + student.PathName)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`[${student.Id}] ${student.FamilyName} ${student.PersonalName}`)
    .setThumbnail(BlueArchiveConstants.SCHALE_STUDENT_ICON_URL + student.CollectionTexture + '.png')
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
    .setImage(BlueArchiveConstants.SCHALE_STUDENT_GEAR_URL + student.Gear.Icon + '.png')
    .setTimestamp()
    .setFooter({
      text: `SCHALE.gg`,
      iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
    });
};
