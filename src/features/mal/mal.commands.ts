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
import { MalService } from './mal.service';
import { MalEmbeds } from './mal.embeds';
import {
  AnimeSearchDto,
  MangaSearchDto,
  CharacterSearchDto,
  PeopleSearchDto,
  GenresDto,
} from './dto';
import { PaginationService } from '../../shared/pagination';
import { ChartService } from '../../shared/chart';
import { splitToChunks, sortArray } from '../../shared/utils';
import * as C from './mal.constants';
import type {
  IAnime,
  IAnimeCharacter,
  IAnimeEpisode,
  IAnimeStaff,
  ICharacter,
  IGenre,
  IManga,
  IPeople,
} from './mal.types';

// --- Anime Button Row ---
function animeRow(isDisable = false, hasManyEpisode = false) {
  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel('👤 Characters')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('animeCharacters')
      .setDisabled(isDisable),
    new ButtonBuilder()
      .setLabel('🎞 Episodes')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('animeEpisodes')
      .setDisabled(isDisable || !hasManyEpisode),
    new ButtonBuilder()
      .setLabel('🎼 Themes')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('animeThemes')
      .setDisabled(isDisable),
    new ButtonBuilder()
      .setLabel('📊 Statistics')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('animeStatistics')
      .setDisabled(isDisable),
    new ButtonBuilder()
      .setLabel('👥 Staff')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('animeStaff')
      .setDisabled(isDisable),
  );
}

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
export class MalCommands {
  constructor(
    private readonly malService: MalService,
    private readonly malEmbeds: MalEmbeds,
    private readonly paginationService: PaginationService,
    private readonly chartService: ChartService,
  ) {}

  // --- Anime ---

  @SlashCommand({ name: 'mal-anime-search', description: 'Search MAL anime' })
  async animeSearch(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: AnimeSearchDto,
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
    if (dto.genres) params.genres = dto.genres;
    if (dto.min_score) params.min_score = dto.min_score;
    if (dto.max_score) params.max_score = dto.max_score;

    try {
      const res = await this.malService.animeSearch(
        new URLSearchParams(params).toString(),
      );
      if (!res.data || res.data.length === 0) {
        return interaction.editReply({ content: '❌ No anime found.' });
      }
      const pages = res.data.map((anime: IAnime, i: number) => ({
        embeds: [
          this.malEmbeds.anime(anime, interaction.user, i + 1, res.data.length),
        ],
        components: [animeRow(!anime.approved, anime.episodes > 1)],
      }));
      return this.paginationService.paginate(interaction, pages, {
        ephemeral: !dto.display,
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  @SlashCommand({
    name: 'mal-anime-genres',
    description: 'Get MAL anime genres',
  })
  async animeGenres(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: GenresDto,
  ) {
    await interaction.deferReply({
      flags: !dto.display ? [MessageFlags.Ephemeral] : [],
    });
    try {
      const res = await this.malService.animeGenres(
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

  // --- Anime Button Handlers ---

  @Button('animeCharacters')
  async animeCharactersBtn(@Context() [interaction]: [ButtonInteraction]) {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({
      flags: isEphemeral ? [MessageFlags.Ephemeral] : [],
    });
    const malId = interaction.message.embeds[0]?.data?.title?.match(
      C.REGEX_GET_ID,
    )?.[1];
    if (!malId)
      return interaction.editReply({ content: '❌ Could not extract ID.' });
    try {
      const res = await this.malService.animeCharacters(malId);
      if (!res.data || res.data.length === 0)
        return interaction.editReply({ content: '❌ No characters.' });
      const pages = res.data.map((ch: IAnimeCharacter, i: number) => {
        ch.anime_mal_id = parseInt(malId);
        return {
          embeds: [
            this.malEmbeds.animeCharacter(
              ch,
              interaction.user,
              i + 1,
              res.data.length,
            ),
          ],
        };
      });
      return this.paginationService.paginate(interaction, pages, {
        ephemeral: isEphemeral,
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  @Button('animeEpisodes')
  async animeEpisodesBtn(@Context() [interaction]: [ButtonInteraction]) {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({
      flags: isEphemeral ? [MessageFlags.Ephemeral] : [],
    });
    const malId = interaction.message.embeds[0]?.data?.title?.match(
      C.REGEX_GET_ID,
    )?.[1];
    if (!malId)
      return interaction.editReply({ content: '❌ Could not extract ID.' });
    try {
      const episodes: IAnimeEpisode[] =
        await this.malService.animeEpisodes(malId);
      if (episodes.length === 0)
        return interaction.editReply({ content: '❌ No episodes.' });
      const chunks = splitToChunks(episodes, C.EPISODES_PER_PAGE);
      const pages = chunks.map((chunk: IAnimeEpisode[], i: number) => ({
        embeds: [
          this.malEmbeds.animeEpisodes(
            chunk,
            interaction.user,
            i + 1,
            chunks.length,
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

  @Button('animeThemes')
  async animeThemesBtn(@Context() [interaction]: [ButtonInteraction]) {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({
      flags: isEphemeral ? [MessageFlags.Ephemeral] : [],
    });
    const malId = interaction.message.embeds[0]?.data?.title?.match(
      C.REGEX_GET_ID,
    )?.[1];
    if (!malId)
      return interaction.editReply({ content: '❌ Could not extract ID.' });
    try {
      const res = await this.malService.animeThemes(malId);
      const themes = res.data;
      if (themes.openings.length === 0 && themes.endings.length === 0)
        return interaction.editReply({ content: '❌ No themes.' });
      themes.anime_mal_id = parseInt(malId);
      return interaction.editReply({
        embeds: [this.malEmbeds.animeTheme(themes, interaction.user)],
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  @Button('animeStaff')
  async animeStaffBtn(@Context() [interaction]: [ButtonInteraction]) {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({
      flags: isEphemeral ? [MessageFlags.Ephemeral] : [],
    });
    const malId = interaction.message.embeds[0]?.data?.title?.match(
      C.REGEX_GET_ID,
    )?.[1];
    if (!malId)
      return interaction.editReply({ content: '❌ Could not extract ID.' });
    try {
      const res = await this.malService.animeStaff(malId);
      if (!res.data || res.data.length === 0)
        return interaction.editReply({ content: '❌ No staff.' });
      const pages = res.data.map((staff: IAnimeStaff, i: number) => ({
        embeds: [
          this.malEmbeds.animeStaff(
            staff,
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

  @Button('animeStatistics')
  async animeStatisticsBtn(@Context() [interaction]: [ButtonInteraction]) {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({
      flags: isEphemeral ? [MessageFlags.Ephemeral] : [],
    });
    const malId = interaction.message.embeds[0]?.data?.title?.match(
      C.REGEX_GET_ID,
    )?.[1];
    if (!malId)
      return interaction.editReply({ content: '❌ Could not extract ID.' });
    try {
      const res = await this.malService.animeStatistics(malId);
      const stats = res.data;
      const overAllStat = {
        watching: stats.watching,
        completed: stats.completed,
        on_hold: stats.on_hold,
        dropped: stats.dropped,
        plan_to_watch: stats.plan_to_watch,
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
          this.malEmbeds.animeStatistics(
            { overAllStat, chart, mal_id: malId },
            interaction.user,
          ),
        ],
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  // --- Manga ---

  @SlashCommand({ name: 'mal-manga-search', description: 'Search MAL manga' })
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

  @SlashCommand({
    name: 'mal-manga-genres',
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
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({
      flags: isEphemeral ? [MessageFlags.Ephemeral] : [],
    });
    const malId = interaction.message.embeds[0]?.data?.title?.match(
      C.REGEX_GET_ID,
    )?.[1];
    if (!malId)
      return interaction.editReply({ content: '❌ Could not extract ID.' });
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
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({
      flags: isEphemeral ? [MessageFlags.Ephemeral] : [],
    });
    const malId = interaction.message.embeds[0]?.data?.title?.match(
      C.REGEX_GET_ID,
    )?.[1];
    if (!malId)
      return interaction.editReply({ content: '❌ Could not extract ID.' });
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

  // --- Character ---

  @SlashCommand({
    name: 'mal-character-search',
    description: 'Search MAL character',
  })
  async characterSearch(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: CharacterSearchDto,
  ) {
    await interaction.deferReply({
      flags: !dto.display ? [MessageFlags.Ephemeral] : [],
    });
    const params: Record<string, any> = {};
    if (dto.q) params.q = dto.q;
    if (dto.order_by) params.order_by = dto.order_by;
    if (dto.sort) params.sort = dto.sort;

    try {
      const res = await this.malService.characterSearch(
        new URLSearchParams(params).toString(),
      );
      if (!res.data || res.data.length === 0)
        return interaction.editReply({ content: '❌ No character found.' });
      const pages = res.data.map((ch: ICharacter, i: number) => ({
        embeds: [
          this.malEmbeds.character(
            ch,
            interaction.user,
            i + 1,
            res.data.length,
          ),
        ],
      }));
      return this.paginationService.paginate(interaction, pages, {
        ephemeral: !dto.display,
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }

  // --- People ---

  @SlashCommand({ name: 'mal-people-search', description: 'Search MAL people' })
  async peopleSearch(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: PeopleSearchDto,
  ) {
    await interaction.deferReply({
      flags: !dto.display ? [MessageFlags.Ephemeral] : [],
    });
    const params: Record<string, any> = {};
    if (dto.q) params.q = dto.q;
    if (dto.order_by) params.order_by = dto.order_by;
    if (dto.sort) params.sort = dto.sort;

    try {
      const res = await this.malService.peopleSearch(
        new URLSearchParams(params).toString(),
      );
      if (!res.data || res.data.length === 0)
        return interaction.editReply({ content: '❌ No people found.' });
      const pages = res.data.map((p: IPeople, i: number) => ({
        embeds: [
          this.malEmbeds.people(p, interaction.user, i + 1, res.data.length),
        ],
      }));
      return this.paginationService.paginate(interaction, pages, {
        ephemeral: !dto.display,
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }
}
