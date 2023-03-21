import { PaginationItem } from '@discordx/pagination';
import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { BlueArchiveConstants } from '../../constants/bluearchive.js';
import { CommonConstants } from '../../constants/common.js';
import { validateDayMonth } from '../../helpers/helper.js';
import { BA_StudentEmbed } from '../../providers/embeds/bluearchiveEmbed.js';
import { BA_Pagination } from '../../providers/paginations/bluearchivePagination.js';
import { getData } from '../../services/bluearchive.js';
import { IStudent } from '../../types/bluearchive/student.js';
import { TPaginationType } from '../../types/common.js';

@Discord()
@SlashGroup({ name: 'buruaka', description: 'Blue Archive commands' })
@SlashGroup({ name: 'info', description: 'Blue Archive info commands', root: 'buruaka' })
export class BlueArchiveSync {
  @SlashGroup('info', 'buruaka')
  @Slash({ name: 'student', description: 'Info student' })
  async syncAll(
    @SlashOption({
      description: 'Public display?',
      name: 'display',
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    isPublic: boolean,
    @SlashChoice({ name: 'Button navigation', value: 'button' })
    @SlashChoice({ name: 'Select menu', value: 'menu' })
    @SlashOption({
      description: 'Navigation type',
      name: 'navigation',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    navigation: TPaginationType,
    @SlashOption({
      description: 'Student name',
      name: 'name',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    Name: string,
    @SlashChoice({ name: 'Only Japan', value: '[true, false]' })
    @SlashChoice({ name: 'Global', value: '[true, true]' })
    @SlashOption({
      description: 'Release status',
      name: 'release-status',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    IsReleased: string,
    @SlashChoice(...BlueArchiveConstants.SCHOOL)
    @SlashOption({
      description: "Student's school",
      name: 'school',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    School: string,
    @SlashOption({
      description: "Student's day of birth",
      name: 'day-of-birth',
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    DayOfBirth: number,
    @SlashChoice(...CommonConstants.MONTHS_IN_YEAR)
    @SlashOption({
      description: "Student's month of birth",
      name: 'month-of-birth',
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    MonthOfBirth: number,
    @SlashOption({
      description: "Student's rarity",
      name: 'rarity',
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    StarGrade: number,
    @SlashChoice(...BlueArchiveConstants.SQUAD_TYPES)
    @SlashOption({
      description: "Student's squad type",
      name: 'squad-type',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    SquadType: string,
    @SlashChoice(...BlueArchiveConstants.TACTIC_ROLE)
    @SlashOption({
      description: "Student's tactic role",
      name: 'tactic-role',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    TacticRole: string,
    @SlashChoice(...BlueArchiveConstants.POSITION)
    @SlashOption({
      description: "Student's position",
      name: 'position',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    Position: string,
    @SlashChoice(...BlueArchiveConstants.ARMOR_TYPES)
    @SlashOption({
      description: "Student's armor type",
      name: 'armor-type',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    ArmorType: string,
    @SlashChoice(...BlueArchiveConstants.BULLET_TYPES)
    @SlashOption({
      description: "Student's bullet type",
      name: 'bullet-type',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    BulletType: string,
    @SlashChoice(...BlueArchiveConstants.WEAPON_TYPE)
    @SlashOption({
      description: "Student's weapon type",
      name: 'weapon-type',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    WeaponType: string,
    @SlashChoice(...BlueArchiveConstants.SCHOOL_YEAR)
    @SlashOption({
      description: "Student's school year",
      name: 'school-year',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    SchoolYear: string,
    @SlashChoice(...BlueArchiveConstants.STUDENT_AGE)
    @SlashOption({
      description: "Student's age",
      name: 'character-age',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    CharacterAge: string,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply({ ephemeral: !isPublic });

    if (DayOfBirth && DayOfBirth < 1 && DayOfBirth > 31) return interaction.editReply('❌ Invalid Day of Birth');

    if (MonthOfBirth && MonthOfBirth < 1 && MonthOfBirth > 12)
      return interaction.editReply('❌ Invalid Month of Birth');

    if (DayOfBirth && MonthOfBirth)
      if (!validateDayMonth(DayOfBirth, MonthOfBirth)) return interaction.editReply('❌ Invalid Birthday');

    let BirthDay = undefined;
    if (DayOfBirth || MonthOfBirth)
      BirthDay = {
        $regex: new RegExp(
          `${MonthOfBirth ? '^' + MonthOfBirth.toString() : ''}/${DayOfBirth ? DayOfBirth.toString() + '$' : ''}`,
          'g',
        ),
      };

    const request: Partial<IStudent> = Object.assign(
      JSON.parse(
        JSON.stringify({
          Name,
          IsReleased: IsReleased && JSON.parse(IsReleased),
          StarGrade,
          SquadType,
          ArmorType,
          BulletType,
          WeaponType,
          School,
          SchoolYear,
          CharacterAge,
          Position,
          TacticRole,
        }),
      ),
      BirthDay && { BirthDay },
    );

    const students: Array<IStudent> = await getData.getStudent(request);

    const pages: Array<PaginationItem> = students.map(
      (student: IStudent, index: number): PaginationItem =>
        Object.assign({
          embeds: [BA_StudentEmbed(student, interaction.user, index + 1, students.length)],
        }),
    );
    const names = students.map((student: IStudent) => student.Name);
    const pagination = BA_Pagination(interaction, pages, navigation, names, isPublic);
    return await pagination.send();
  }
}
