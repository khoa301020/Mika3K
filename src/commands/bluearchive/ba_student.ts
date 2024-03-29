import { PaginationItem } from '@discordx/pagination';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  MessageActionRowComponentBuilder,
  MessageFlags,
} from 'discord.js';
import { ButtonComponent, Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { FilterQuery } from 'mongoose';
import { BlueArchiveConstants, CommonConstants, MALConstants } from '../../constants/index.js';
import {
  BA_StudentEmbed,
  BA_StudentGearEmbed,
  BA_StudentProfileEmbed,
  BA_StudentSkillsEmbed,
  BA_StudentStatsEmbed,
  BA_StudentWeaponEmbed,
} from '../../providers/embeds/bluearchiveEmbed.js';
import { commonPagination } from '../../providers/pagination.js';
import { getData } from '../../services/bluearchive.js';
import { IFurniture } from '../../types/bluearchive/furniture.js';
import {
  ArmorType,
  BulletType,
  CharacterAge,
  Equipment,
  IStudent,
  Position,
  School,
  SchoolYear,
  SquadType,
  TacticRole,
  WeaponType,
} from '../../types/bluearchive/student.js';
import { TPaginationType } from '../../types/common.js';
import { editOrReplyThenDelete, isObjectEmpty, validateDayMonth } from '../../utils/index.js';

const studentMoreInfoBtn = () =>
  new ButtonBuilder().setLabel('👤 Profile').setStyle(ButtonStyle.Primary).setCustomId('studentProfile');

const studentStatsBtn = () =>
  new ButtonBuilder().setLabel('📊 Stats').setStyle(ButtonStyle.Primary).setCustomId('studentStats');

const studentSkillsBtn = () =>
  new ButtonBuilder().setLabel('🎯 Skills').setStyle(ButtonStyle.Primary).setCustomId('studentSkills');
const studentWeaponBtn = () =>
  new ButtonBuilder().setLabel('🔫 Weapon').setStyle(ButtonStyle.Primary).setCustomId('studentWeapon');

const studentGearBtn = (hasGear: boolean) =>
  new ButtonBuilder()
    .setLabel('⚙️ Gear')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('studentGear')
    .setDisabled(!hasGear);

const studentRow = (hasGear: boolean) =>
  new ActionRowBuilder<MessageActionRowComponentBuilder>()
    .addComponents(studentMoreInfoBtn())
    .addComponents(studentStatsBtn())
    .addComponents(studentSkillsBtn())
    .addComponents(studentWeaponBtn())
    .addComponents(studentGearBtn(hasGear));

@Discord()
@SlashGroup({ name: 'buruaka', description: 'Blue Archive commands' })
export class BlueArchiveInfo {
  @SlashGroup('buruaka')
  @Slash({ name: 'student', description: 'Info student' })
  async infoStudent(
    @SlashOption({
      description: 'Public display?',
      name: 'display',
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    isPublic: boolean,
    @SlashChoice({ name: 'Button navigation', value: CommonConstants.PAGINATION_TYPE.BUTTON })
    @SlashChoice({ name: 'Select menu', value: CommonConstants.PAGINATION_TYPE.MENU })
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
    PersonalName: string,
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
    School: School,
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
    @SlashChoice(...BlueArchiveConstants.STUDENT_RARITY)
    @SlashOption({
      description: "Student's rarity",
      name: 'rarity',
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    StarGrade: number,
    @SlashOption({
      description: "Student's artist",
      name: 'artist',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    Illustrator: string,
    @SlashChoice(...BlueArchiveConstants.SQUAD_TYPES)
    @SlashOption({
      description: "Student's squad type",
      name: 'squad-type',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    SquadType: SquadType,
    @SlashChoice(...BlueArchiveConstants.TACTIC_ROLE)
    @SlashOption({
      description: "Student's tactic role",
      name: 'tactic-role',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    TacticRole: TacticRole,
    @SlashChoice(...BlueArchiveConstants.POSITION)
    @SlashOption({
      description: "Student's position",
      name: 'position',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    Position: Position,
    @SlashChoice(...BlueArchiveConstants.ARMOR_TYPES)
    @SlashOption({
      description: "Student's armor type",
      name: 'armor-type',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    ArmorType: ArmorType,
    @SlashChoice(...BlueArchiveConstants.BULLET_TYPES)
    @SlashOption({
      description: "Student's bullet type",
      name: 'bullet-type',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    BulletType: BulletType,
    @SlashChoice(...BlueArchiveConstants.WEAPON_TYPE)
    @SlashOption({
      description: "Student's weapon type",
      name: 'weapon-type',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    WeaponType: WeaponType,
    @SlashChoice(...Object.keys(BlueArchiveConstants.EQUIPMENT_TYPES))
    @SlashOption({
      description: "Student's equipment",
      name: 'equipment',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    Equipment: Equipment,
    @SlashChoice(...BlueArchiveConstants.SCHOOL_YEAR)
    @SlashOption({
      description: "Student's school year",
      name: 'school-year',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    SchoolYear: SchoolYear,
    @SlashChoice(...BlueArchiveConstants.STUDENT_AGE)
    @SlashOption({
      description: "Student's age",
      name: 'student-age',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    CharacterAge: CharacterAge,
    @SlashChoice(
      ...Object.entries(BlueArchiveConstants.SORT_BY).map(([key, value]) => Object({ name: key, value: value })),
    )
    @SlashOption({
      description: 'Select sort by (Sort name by default)',
      name: 'sort-by',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    sortBy: string = 'Name',
    @SlashChoice({ name: 'Ascending', value: 1 })
    @SlashChoice({ name: 'Descending', value: -1 })
    @SlashOption({
      description: 'Select order by (Ascending by default)',
      name: 'order-by',
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    orderBy: number = 1,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply({ ephemeral: !isPublic });

    if (DayOfBirth && DayOfBirth < 1 && DayOfBirth > 31)
      return editOrReplyThenDelete(interaction, '❌ Invalid Day of Birth');

    if (MonthOfBirth && MonthOfBirth < 1 && MonthOfBirth > 12)
      return editOrReplyThenDelete(interaction, '❌ Invalid Month of Birth');

    if (DayOfBirth && MonthOfBirth)
      if (!validateDayMonth(DayOfBirth, MonthOfBirth)) return editOrReplyThenDelete(interaction, '❌ Invalid Birthday');

    let BirthDay = undefined;
    if (DayOfBirth || MonthOfBirth)
      BirthDay = {
        $regex: new RegExp(
          `${MonthOfBirth ? '^' + MonthOfBirth.toString() : ''}/${DayOfBirth ? DayOfBirth.toString() + '$' : ''}`,
          'g',
        ),
      };

    const query: FilterQuery<IStudent> = Object.assign(
      JSON.parse(
        JSON.stringify({
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
          Illustrator,
        }),
      ),
      Equipment && { Equipment: { $elemMatch: { $eq: Equipment } } },
      PersonalName && { PersonalName: { $regex: new RegExp(`^${PersonalName}`, 'i') } },
      BirthDay && { BirthDay },
    );

    const sort = {
      [sortBy]: orderBy,
    };

    try {
      const students: Array<IStudent> = await getData.getStudent(sort, query);

      if (students.length === 0) return editOrReplyThenDelete(interaction, '❌ No student found.');

      const pages: Array<PaginationItem> = students.map(
        (student: IStudent, index: number): PaginationItem =>
          Object.assign({
            embeds: [BA_StudentEmbed(student, interaction.user, index + 1, students.length)],
            components: [studentRow(!isObjectEmpty(student.Gear))],
          }),
      );
      const names = students.map((student: IStudent) => student.Name);
      const pagination = commonPagination(interaction, pages, navigation, !isPublic, names);
      return await pagination.send();
    } catch (err: any) {
      console.log(err);
      return editOrReplyThenDelete(interaction, '❌ ' + err.message);
    }
  }
  @ButtonComponent({ id: 'studentProfile' })
  async profileBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({ ephemeral: isEphemeral });
    const student_id = interaction.message.embeds[0].data.description?.match(MALConstants.REGEX_GET_ID)![1];

    try {
      const student: IStudent | null = await getData.getStudentById(parseInt(student_id!));
      if (!student || isObjectEmpty(student)) {
        interaction.editReply({ content: 'No student found.' });
        return;
      }

      const furnitures: Array<IFurniture> = await getData.getFurnitures(
        student.FurnitureInteraction[0].map((subArr) => subArr[0]),
      );

      const embed = BA_StudentProfileEmbed(student, interaction.user, furnitures);

      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: err.message, ephemeral: isEphemeral! });
    }
  }

  @ButtonComponent({ id: 'studentStats' })
  async statsBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({ ephemeral: isEphemeral });
    const student_id = interaction.message.embeds[0].data.description?.match(MALConstants.REGEX_GET_ID)![1];

    try {
      const student: IStudent | null = await getData.getStudentById(parseInt(student_id!));
      if (!student || isObjectEmpty(student)) {
        interaction.editReply({ content: 'No student found.' });
        return;
      }

      const embed = BA_StudentStatsEmbed(student, interaction.user);

      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: err.message, ephemeral: isEphemeral! });
    }
  }

  @ButtonComponent({ id: 'studentSkills' })
  async skillsBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({ ephemeral: isEphemeral });
    const student_id = interaction.message.embeds[0].data.description?.match(MALConstants.REGEX_GET_ID)![1];

    try {
      const student: IStudent | null = await getData.getStudentById(parseInt(student_id!));
      if (!student || isObjectEmpty(student)) {
        interaction.editReply({ content: 'No student found.' });
        return;
      }

      // Add summons skill if exist
      if (student.Summons.length > 0) {
        const summonsIds = student.Summons.map((summon) => summon.Id);
        const summons = await getData.getSummons(summonsIds);
        summons.sort((a, b) => summonsIds.indexOf(a.Id) - summonsIds.indexOf(b.Id));
        student.Summons.forEach((summon, index) => (summon.Info = summons[index]));
      }

      // Add TSA skill if TSA partner exist
      if (student.TSAId) {
        const TsaStudent = await getData.getStudentById(student.TSAId);
        const TsaSkills = TsaStudent?.Skills.filter((skill) => skill.ExtraSkills?.find((extraSkill) => extraSkill.TSAId === student.Id));
        if (TsaSkills && TsaSkills.length > 0) {
          student.Skills.forEach((skill) => {
            const extraSkill = TsaSkills.find((TsaSkill) => TsaSkill.SkillType === skill.SkillType)?.ExtraSkills?.find((tsaExtraSkill) => tsaExtraSkill.TSAId === student.Id);
            if (extraSkill) {
              extraSkill.TSAId = TsaStudent?.Id;
              extraSkill.TSAName = TsaStudent?.Name;
              if (!skill.ExtraSkills) skill.ExtraSkills = [];
              skill.ExtraSkills.push(extraSkill);
            }
          });
        }
      }

      // Set TSA partner name if TSA extra skill exist
      if (student.Skills.find((skill) => skill.ExtraSkills?.find((extraSkill) => extraSkill.TSAId))) {
        const allTsaPartnerIds = student.Skills.reduce((acc, skill) => {
          const extraSkills = skill.ExtraSkills?.filter((extraSkill) => extraSkill.TSAId);
          if (extraSkills) acc.push(...extraSkills.map((extraSkill) => extraSkill.TSAId!));
          return acc;
        }, [] as number[]);

        const allTsaPartners = await getData.getStudentByIds(allTsaPartnerIds);

        student.Skills.forEach((skill) => {
          if (skill.ExtraSkills) {
            skill.ExtraSkills.forEach((extraSkill) => {
              const tsaPartner = allTsaPartners.find((tsaPartner) => tsaPartner.Id === extraSkill.TSAId);
              if (tsaPartner) extraSkill.TSAName = tsaPartner.Name;
            });
          }
        });
      }

      const embed = BA_StudentSkillsEmbed(student, interaction.user);

      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: err.message, ephemeral: isEphemeral! });
    }
  }

  @ButtonComponent({ id: 'studentWeapon' })
  async weaponBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({ ephemeral: isEphemeral });
    const student_id = interaction.message.embeds[0].data.description?.match(MALConstants.REGEX_GET_ID)![1];

    try {
      const student: IStudent | null = await getData.getStudentById(parseInt(student_id!));
      if (!student || isObjectEmpty(student)) {
        interaction.editReply({ content: 'No student found.' });
        return;
      }

      const embed = BA_StudentWeaponEmbed(student, interaction.user);

      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: err.message, ephemeral: isEphemeral! });
    }
  }

  @ButtonComponent({ id: 'studentGear' })
  async gearBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({ ephemeral: isEphemeral });
    const student_id = interaction.message.embeds[0].data.description?.match(MALConstants.REGEX_GET_ID)![1];

    try {
      const student: IStudent | null = await getData.getStudentById(parseInt(student_id!));
      if (!student || isObjectEmpty(student)) {
        interaction.editReply({ content: 'No student found.' });
        return;
      }

      const embed = BA_StudentGearEmbed(student, interaction.user);

      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: err.message, ephemeral: isEphemeral! });
    }
  }
}
