import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { decode } from 'html-entities';
import { BlueArchiveConstants } from '../../constants/index.js';
import { IStudent } from '../../types/bluearchive/student.js';

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
        value: `${student.IsReleased[1] ? 'Global' : 'Japan only'} (${
          BlueArchiveConstants.STUDENT_TYPE[student.IsLimited]
        })`,
        inline: true,
      },
      { name: 'Artist', value: student.ArtistName, inline: true },
      { name: 'Seiyuu', value: student.CharacterVoice, inline: true },
      { name: 'Birthday', value: student.Birthday, inline: true },
      { name: 'Age', value: student.CharacterAge, inline: true },
      { name: 'Height', value: student.CharHeightMetric, inline: true },
      { name: 'School', value: student.School, inline: true },
      { name: 'School year', value: student.SchoolYear.length > 0 ? student.SchoolYear : 'N/A', inline: true },
      { name: 'Club', value: student.Club, inline: true },
      {
        name: 'Squad type ',
        value: student.SquadType,
        inline: true,
      },
      { name: 'Position', value: student.Position, inline: true },
      {
        name: 'Tactic role',
        value: student.TacticRole,
        inline: true,
      },
      {
        name: 'Armor type',
        value: student.ArmorType,
        inline: true,
      },
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
    .setImage(BlueArchiveConstants.SCHALE_IMAGE_STUDENT_URL + 'Portrait_' + student.DevName + '.webp')
    .setTimestamp()
    .setFooter({
      text: `SCHALE.gg ${page !== null && total !== null && `(${page?.toString()}/${total?.toString()})`}`,
      iconURL: BlueArchiveConstants.SCHALE_GG_LOGO,
    });
};
