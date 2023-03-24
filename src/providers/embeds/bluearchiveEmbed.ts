import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { decode } from 'html-entities';
import { BlueArchiveConstants } from '../../constants/index.js';
import { cache } from '../../main.js';
import { SchaleMath, transformSkillStat } from '../../services/bluearchive.js';
import { ILocalization } from '../../types/bluearchive/localization.js';
import { IStudent, Skill } from '../../types/bluearchive/student.js';

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
      { name: 'Artist', value: student.ArtistName, inline: true },
      { name: 'Seiyuu', value: student.CharacterVoice, inline: true },
      { name: 'Birthday', value: student.Birthday, inline: true },
      { name: 'Age', value: student.CharacterAge, inline: true },
      { name: 'Height', value: student.CharHeightMetric, inline: true },
      { name: 'School', value: student.SchoolLong!, inline: true },
      { name: 'School year', value: student.SchoolYear.length > 0 ? student.SchoolYear : 'N/A', inline: true },
      { name: 'Club', value: student.Club, inline: true },
      { name: 'Squad type ', value: student.SquadType, inline: true },
      { name: 'Position', value: student.Position, inline: true },
      { name: 'Tactic role', value: student.TacticRole, inline: true },
      { name: 'Armor type', value: student.ArmorType, inline: true },
      { name: 'Weapon type', value: student.WeaponType, inline: true },
      { name: 'Use cover', value: student.Cover ? 'Yes' : 'No', inline: true },
      {
        name: 'Adaptation',
        value: `Urban: ${BlueArchiveConstants.ADAPTATION_ICON[student.StreetBattleAdaptation]}, Indoor: ${
          BlueArchiveConstants.ADAPTATION_ICON[student.IndoorBattleAdaptation]
        }, Outdoor: ${BlueArchiveConstants.ADAPTATION_ICON[student.OutdoorBattleAdaptation]}`,
        inline: true,
      },
      { name: 'Introduction', value: decode(student.ProfileIntroduction) },
    )
    .setImage(BlueArchiveConstants.SCHALE_STUDENT_PORTRAIT_URL + 'Portrait_' + student.DevName + '.webp')
    .setTimestamp()
    .setFooter({
      text: `SCHALE.gg ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
      iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
    });
};

export const BA_StudentStatsEmbed = (student: IStudent, author: User): EmbedBuilder => {
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
        value: `\`\`\`HP   : ${student.MaxHP1} / ${student.MaxHP100}\nATK  : ${student.AttackPower1} / ${student.AttackPower100}\nDEF  : ${student.DefensePower1} / ${student.DefensePower100}\nHEAL : ${student.HealPower1} / ${student.HealPower100}\`\`\``,
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
      { name: 'Name', value: `\`\`\`${student.Weapon.Name}\`\`\`` },
      { name: `[Skill upgrade] ${passiveSkillUpgrade.Name}`, value: `\`\`\`${passiveSkillUpgrade.Desc!}\`\`\`` },
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
        value: `\`\`\`HP   : ${student.Weapon.MaxHP1} / ${student.Weapon.MaxHP100}\nATK  : ${student.Weapon.AttackPower1} / ${student.Weapon.AttackPower100}\nHEAL : ${student.Weapon.HealPower1} / ${student.Weapon.HealPower100}\`\`\``,
      },
    )
    .setImage(BlueArchiveConstants.SCHALE_STUDENT_WEAPON_URL + student.WeaponImg + '.png')
    .setTimestamp()
    .setFooter({
      text: `SCHALE.gg`,
      iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
    });
};
