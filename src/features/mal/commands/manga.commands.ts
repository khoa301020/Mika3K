import { MalCommandDecorator } from './decorators';
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
import { ChartService } from '../../../shared/chart';
import { PaginationService } from '../../../shared/pagination';
import { sortArray, splitToChunks } from '../../../shared/utils';
import { GenresDto, MangaSearchDto } from '../dto';
import * as C from '../mal.constants';
import { MalEmbeds } from '../mal.embeds';
import { MalService } from '../mal.service';
import type { IGenre, IManga } from '../mal.types';

function mangaRow() {
  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel('👤 Characters')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('mangaCharacters'),
    new ButtonBuilder()
      .setLabel('📊 Statistics')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('mangaStatistics'),
  );
}

@Injectable()
@MalCommandDecorator({ name: 'manga', description: 'Manga commands' })
export class MangaCommands {
  constructor(
    private readonly malService: MalService,
    private readonly malEmbeds: MalEmbeds,
    private readonly paginationService: PaginationService,
    private readonly chartService: ChartService,
  ) {}

  private async extractEntityIdFromEmbed(
    interaction: ButtonInteraction,
  ): Promise<{ malId: string | undefined; isEphemeral: boolean }> {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({
      flags: isEphemeral ? [MessageFlags.Ephemeral] : [],
    });
    const malId = interaction.message.embeds[0]?.data?.title?.match(
      C.REGEX_GET_ID,
    )?.[1];
    if (!malId) {
      await interaction.editReply({ content: '❌ Could not extract ID.' });
    }
    return { malId, isEphemeral };
  }

  @Subcommand({ name: 'search', description: 'Search MAL manga' })
  async mangaSearch(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: MangaSearchDto,
  ) {
    await interaction.deferReply({
      flags: !dto.display ? [MessageFlags.Ephemeral] : [],
    });
    const params: Record<string, any> = { sfw: dto.sfw ?? true };
    if (dto.q) params.q = dto.q;
    if (dto.type) params.type = dto.type;
    if (dto.status) params.status = dto.status;
    if (dto.order_by) params.order_by = dto.order_by;
    if (dto.sort) params.sort = dto.sort;

    try {
      const res = await this.malService.mangaSearch(
        new URLSearchParams(params).toString(),
      );
      if (!res.data || res.data.length === 0)
        return interaction.editReply({ content: '❌ No manga found.' });
      const pages = res.data.map((manga: IManga, i: number) => ({
        embeds: [
          this.malEmbeds.manga(manga, interaction.user, i + 1, res.data.length),
        ],
        components: [mangaRow()],
      }));
      return this.paginationService.paginate(interaction, pages, {
        ephemeral: !dto.display,
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  @Subcommand({ name: 'genres',
    description: 'Get MAL manga genres',
  })
  async mangaGenres(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: GenresDto,
  ) {
    await interaction.deferReply({
      flags: !dto.display ? [MessageFlags.Ephemeral] : [],
    });
    try {
      const res = await this.malService.mangaGenres(
        dto.filter ? `filter=${dto.filter}` : '',
      );
      if (!res.data || res.data.length === 0)
        return interaction.editReply({ content: '❌ No genres found.' });
      const genres: IGenre[] = sortArray.desc(res.data, 'count');
      const chunks = splitToChunks(genres, C.GENRES_PER_PAGE);
      const pages = chunks.map((chunk: IGenre[], i: number) => ({
        embeds: [
          this.malEmbeds.genres(chunk, interaction.user, i + 1, chunks.length),
        ],
      }));
      return this.paginationService.paginate(interaction, pages, {
        ephemeral: !dto.display,
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  // --- Manga Button Handlers ---

  @Button('mangaCharacters')
  async mangaCharactersBtn(@Context() [interaction]: [ButtonInteraction]) {
    const { malId, isEphemeral } =
      await this.extractEntityIdFromEmbed(interaction);
    if (!malId) return;
    try {
      const res = await this.malService.mangaCharacters(malId);
      if (!res.data || res.data.length === 0)
        return interaction.editReply({ content: '❌ No characters.' });
      const pages = res.data.map((ch: any, i: number) => ({
        embeds: [
          this.malEmbeds.mangaCharacter(
            ch,
            interaction.user,
            i + 1,
            res.data.length,
          ),
        ],
      }));
      return this.paginationService.paginate(interaction, pages, {
        ephemeral: isEphemeral,
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  @Button('mangaStatistics')
  async mangaStatisticsBtn(@Context() [interaction]: [ButtonInteraction]) {
    const { malId } = await this.extractEntityIdFromEmbed(interaction);
    if (!malId) return;
    try {
      const res = await this.malService.mangaStatistics(malId);
      const stats = res.data;
      const overAllStat = {
        reading: stats.reading,
        completed: stats.completed,
        on_hold: stats.on_hold,
        dropped: stats.dropped,
        plan_to_read: stats.plan_to_read,
        total: stats.total,
      };
      const chart = this.chartService.create(
        {
          type: 'doughnut',
          data: {
            labels: stats.scores.map((s: any) => s.score),
            datasets: [{ data: stats.scores.map((s: any) => s.votes) }],
          },
        },
        800,
        400,
      );
      return interaction.editReply({
        embeds: [
          this.malEmbeds.mangaStatistics(
            { overAllStat, chart, mal_id: malId },
            interaction.user,
          ),
        ],
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }
}
