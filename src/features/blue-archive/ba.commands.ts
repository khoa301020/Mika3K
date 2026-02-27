import { Injectable } from '@nestjs/common';
import { Context, Options, SlashCommand, Button } from 'necord';
import type { SlashCommandContext } from 'necord';
import type { ButtonInteraction } from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
  MessageFlags,
} from 'discord.js';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NotifyChannel, type NotifyChannelDocument } from './ba.schemas';
import { BaService } from './ba.service';
import { BaEmbeds } from './ba.embeds';
import { StudentSearchDto, RaidSearchDto, ServerStatusDto, BaNotifyDto } from './dto';
import { PaginationService } from '../../shared/pagination';
import { AppCacheService } from '../../shared/cache';
import * as C from './ba.constants';
import type { IStudent } from './types/student';
import type { IConfig, CurrentGacha, CurrentRaid } from './types/config';
import { isObjectEmpty } from '../../shared/utils';

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
export class BaCommands {
  constructor(
    private readonly baService: BaService,
    private readonly baEmbeds: BaEmbeds,
    private readonly paginationService: PaginationService,
    private readonly cacheService: AppCacheService,
    @InjectModel(NotifyChannel.name)
    private readonly notifyModel: Model<NotifyChannelDocument>,
  ) {}

  @SlashCommand({
    name: 'ba-notify',
    description: 'Toggle SchaleDB update notifications for this channel',
  })
  public async toggleNotify(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: BaNotifyDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    // Owner-only check
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.editReply({
        content: '❌ Only the bot owner can use this command.',
      });
    }

    if (dto.action === 'on') {
      await this.notifyModel.findOneAndUpdate(
        { channelId: interaction.channelId, notifyType: C.BA_SCHALEDB_UPDATE },
        { guildId: interaction.guildId!, channelId: interaction.channelId, notifyType: C.BA_SCHALEDB_UPDATE },
        { upsert: true },
      );
      return interaction.editReply({
        content: '✅ SchaleDB update notifications **enabled** for this channel.',
      });
    } else {
      await this.notifyModel.findOneAndDelete({
        channelId: interaction.channelId,
        notifyType: C.BA_SCHALEDB_UPDATE,
      });
      return interaction.editReply({
        content: '✅ SchaleDB update notifications **disabled** for this channel.',
      });
    }
  }

  @SlashCommand({
    name: 'ba-student',
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

  @SlashCommand({ name: 'ba-raid', description: 'Search Blue Archive raid' })
  async raidSearch(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: RaidSearchDto,
  ) {
    await interaction.deferReply({
      flags: !dto.display ? [MessageFlags.Ephemeral] : [],
    });
    try {
      const raid = await this.baService.getRaidById(dto.raidId);
      if (!raid)
        return interaction.editReply({ content: '❌ Raid not found.' });
      if (C.RAID_DIFFICULTIES[dto.difficulty] > raid.MaxDifficulty[0])
        return interaction.editReply({
          content: `❌ Unavailable difficulty **${dto.difficulty}** for **${raid.Name}**.`,
        });
      return interaction.editReply({
        embeds: [
          await this.baEmbeds.raid(raid, dto.difficulty, interaction.user),
        ],
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  @SlashCommand({
    name: 'ba-server',
    description: "Get Blue Archive server's status",
  })
  async serverStatus(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: ServerStatusDto,
  ) {
    await interaction.deferReply();
    const config = await this.cacheService.get<IConfig>('BA_Common');
    if (!config)
      return interaction.editReply({ content: '❌ Cache not found.' });

    const region = config.Regions[dto.regionId];
    region.studentsCount = await this.baService.getStudentCount(dto.regionId);
    region.raidsCount = await this.baService.getRaidCount(dto.regionId);
    region.eventsCount = region.Events?.length ?? 0;
    region.rerunEventsCount = (region.Events ?? []).filter((e: number) =>
      /^10/.test(e.toString()),
    ).length;
    region.incomingBirthdayStudents =
      await this.baService.getStudentHasBirthdayNextWeek(dto.regionId);

    // Populate raid info
    const raids: Array<CurrentRaid & { info?: any }> = (
      region.CurrentRaid ?? []
    ).filter((r: any) => r.raid.toString().length < 4);
    const timeAttacks: Array<CurrentRaid & { info?: any }> = (
      region.CurrentRaid ?? []
    ).filter((r: any) => r.raid.toString().length >= 4);
    const raidPromises: Promise<any>[] = [];
    raids.forEach((r, i, arr) =>
      raidPromises.push(
        this.baService.getRaidById(r.raid).then((info) => {
          if (info) arr[i].info = info;
        }),
      ),
    );
    timeAttacks.forEach((ta, i, arr) =>
      raidPromises.push(
        this.baService.getTimeAttackById(ta.raid).then((info) => {
          if (info) arr[i].info = info;
        }),
      ),
    );
    await Promise.all(raidPromises);

    // Populate gacha character info
    const gachaPromises: Promise<any>[] = [];
    (region.CurrentGacha ?? []).forEach(
      (gacha: CurrentGacha, i: number, arr: any) => {
        gachaPromises.push(
          this.baService
            .getStudentByIds(gacha.characters as any)
            .then((students) => {
              if (students.length > 0) arr[i].characters = students;
            }),
        );
      },
    );
    await Promise.all(gachaPromises);

    return interaction.editReply({
      embeds: [await this.baEmbeds.server(region, interaction.user)],
    });
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
      // Set TSA partner names
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
