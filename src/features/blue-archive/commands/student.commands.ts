import { BuruakaCommandDecorator } from './decorators';
import { Injectable } from '@nestjs/common';
import type { ButtonInteraction } from 'discord.js';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageActionRowComponentBuilder,
    MessageFlags,
} from 'discord.js';
import type { SlashCommandContext } from 'necord';
import { Button, Context, Options, Subcommand } from 'necord';
import { PaginationService } from '../../../shared/pagination';
import { isObjectEmpty } from '../../../shared/utils';
import * as C from '../ba.constants';
import { BaEmbeds } from '../ba.embeds';
import { BaService } from '../ba.service';
import { StudentSearchDto } from '../dto';
import type { IStudent } from '../types/student';

function studentRow(hasGear: boolean) {
  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel('👤 Profile')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('studentProfile'),
    new ButtonBuilder()
      .setLabel('📊 Stats')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('studentStats'),
    new ButtonBuilder()
      .setLabel('🎯 Skills')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('studentSkills'),
    new ButtonBuilder()
      .setLabel('🔫 Weapon')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('studentWeapon'),
    new ButtonBuilder()
      .setLabel('⚙️ Gear')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('studentGear')
      .setDisabled(!hasGear),
  );
}

@Injectable()
@BuruakaCommandDecorator()
export class StudentCommands {
  constructor(
    private readonly baService: BaService,
    private readonly baEmbeds: BaEmbeds,
    private readonly paginationService: PaginationService,
  ) {}

  @Subcommand({ name: 'student',
    description: 'Search Blue Archive students',
  })
  async studentSearch(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: StudentSearchDto,
  ) {
    await interaction.deferReply({
      flags: !dto.display ? [MessageFlags.Ephemeral] : [],
    });
    const query: Record<string, any> = {};
    if (dto.name)
      query.PersonalName = { $regex: new RegExp(`^${dto.name}`, 'i') };
    if (dto.school) query.School = dto.school;
    if (dto.rarity) query.StarGrade = dto.rarity;
    if (dto.squadType) query.SquadType = dto.squadType;
    if (dto.tacticRole) query.TacticRole = dto.tacticRole;
    if (dto.position) query.Position = dto.position;
    if (dto.armorType) query.ArmorType = dto.armorType;
    if (dto.bulletType) query.BulletType = dto.bulletType;

    const sort = { [dto.sortBy ?? 'Name']: dto.orderBy ?? 1 };

    try {
      const students = await this.baService.getStudent(sort, query);
      if (students.length === 0)
        return interaction.editReply({ content: '❌ No student found.' });
      const pages = students.map((student: IStudent, i: number) => ({
        embeds: [
          this.baEmbeds.student(
            student,
            interaction.user,
            i + 1,
            students.length,
          ),
        ],
        components: [studentRow(!isObjectEmpty(student.Gear))],
      }));
      return this.paginationService.paginate(interaction, pages, {
        ephemeral: !dto.display,
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  // --- Student Button Handlers ---

  @Button('studentProfile')
  async profileBtn(@Context() [interaction]: [ButtonInteraction]) {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({
      flags: isEphemeral ? [MessageFlags.Ephemeral] : [],
    });
    const id = interaction.message.embeds[0]?.data?.description?.match(
      C.REGEX_GET_ID,
    )?.[1];
    if (!id)
      return interaction.editReply({ content: '❌ Could not extract ID.' });
    try {
      const student = await this.baService.getStudentById(parseInt(id));
      if (!student)
        return interaction.editReply({ content: '❌ No student found.' });
      const furnitures = await this.baService.getFurnitures(
        student.FurnitureInteraction[0].map((s: any) => s[0]),
      );
      return interaction.editReply({
        embeds: [
          await this.baEmbeds.studentProfile(
            student,
            interaction.user,
            furnitures,
          ),
        ],
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  @Button('studentStats')
  async statsBtn(@Context() [interaction]: [ButtonInteraction]) {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({
      flags: isEphemeral ? [MessageFlags.Ephemeral] : [],
    });
    const id = interaction.message.embeds[0]?.data?.description?.match(
      C.REGEX_GET_ID,
    )?.[1];
    if (!id)
      return interaction.editReply({ content: '❌ Could not extract ID.' });
    try {
      const student = await this.baService.getStudentById(parseInt(id));
      if (!student)
        return interaction.editReply({ content: '❌ No student found.' });
      return interaction.editReply({
        embeds: [this.baEmbeds.studentStats(student, interaction.user)],
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  @Button('studentSkills')
  async skillsBtn(@Context() [interaction]: [ButtonInteraction]) {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({
      flags: isEphemeral ? [MessageFlags.Ephemeral] : [],
    });
    const id = interaction.message.embeds[0]?.data?.description?.match(
      C.REGEX_GET_ID,
    )?.[1];
    if (!id)
      return interaction.editReply({ content: '❌ Could not extract ID.' });
    try {
      const student = await this.baService.getStudentById(parseInt(id));
      if (!student)
        return interaction.editReply({ content: '❌ No student found.' });
      if (student.Summons?.length > 0) {
        const summons = await this.baService.getSummons(
          student.Summons.map((s) => s.Id),
        );
        summons.sort(
          (a, b) =>
            student.Summons.findIndex((s) => s.Id === a.Id) -
            student.Summons.findIndex((s) => s.Id === b.Id),
        );
        student.Summons.forEach((s, i) => (s.Info = summons[i]));
      }
      if (student.TSAId) {
        const tsaStudent = await this.baService.getStudentById(student.TSAId);
        const tsaSkills = tsaStudent?.Skills.filter((s) =>
          s.ExtraSkills?.find((es) => es.TSAId === student.Id),
        );
        if (tsaSkills?.length) {
          student.Skills.forEach((skill) => {
            const extra = tsaSkills
              .find((ts) => ts.SkillType === skill.SkillType)
              ?.ExtraSkills?.find((es) => es.TSAId === student.Id);
            if (extra) {
              extra.TSAId = tsaStudent?.Id;
              extra.TSAName = tsaStudent?.Name;
              if (!skill.ExtraSkills) skill.ExtraSkills = [];
              skill.ExtraSkills.push(extra);
            }
          });
        }
      }
      const allTsaIds = student.Skills.reduce((acc, s) => {
        const extras = s.ExtraSkills?.filter((es) => es.TSAId);
        if (extras) acc.push(...extras.map((es) => es.TSAId!));
        return acc;
      }, [] as number[]);
      if (allTsaIds.length > 0) {
        const partners = await this.baService.getStudentByIds(allTsaIds);
        student.Skills.forEach((s) => {
          s.ExtraSkills?.forEach((es) => {
            const p = partners.find((p2) => p2.Id === es.TSAId);
            if (p) es.TSAName = p.Name;
          });
        });
      }
      return interaction.editReply({
        embeds: [await this.baEmbeds.studentSkills(student, interaction.user)],
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  @Button('studentWeapon')
  async weaponBtn(@Context() [interaction]: [ButtonInteraction]) {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({
      flags: isEphemeral ? [MessageFlags.Ephemeral] : [],
    });
    const id = interaction.message.embeds[0]?.data?.description?.match(
      C.REGEX_GET_ID,
    )?.[1];
    if (!id)
      return interaction.editReply({ content: '❌ Could not extract ID.' });
    try {
      const student = await this.baService.getStudentById(parseInt(id));
      if (!student)
        return interaction.editReply({ content: '❌ No student found.' });
      return interaction.editReply({
        embeds: [await this.baEmbeds.studentWeapon(student, interaction.user)],
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  @Button('studentGear')
  async gearBtn(@Context() [interaction]: [ButtonInteraction]) {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({
      flags: isEphemeral ? [MessageFlags.Ephemeral] : [],
    });
    const id = interaction.message.embeds[0]?.data?.description?.match(
      C.REGEX_GET_ID,
    )?.[1];
    if (!id)
      return interaction.editReply({ content: '❌ Could not extract ID.' });
    try {
      const student = await this.baService.getStudentById(parseInt(id));
      if (!student)
        return interaction.editReply({ content: '❌ No student found.' });
      return interaction.editReply({
        embeds: [await this.baEmbeds.studentGear(student, interaction.user)],
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }
}
