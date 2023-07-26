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
import { CommonConstants, MALConstants } from '../../constants/index.js';
import { createChart, editOrReplyThenDelete, sortArray, splitToChunks } from '../../helpers/helper.js';
import {
  MAL_AnimeCharacterEmbed,
  MAL_AnimeEmbed,
  MAL_AnimeEpisodeEmbed,
  MAL_AnimeStaffEmbed,
  MAL_AnimeStatisticsEmbed,
  MAL_AnimeThemeEmbed,
  MAL_GenresEmbed,
} from '../../providers/embeds/malEmbed.js';
import { commonPagination } from '../../providers/pagination.js';
import { animeApi } from '../../services/mal.js';
import { TPaginationType } from '../../types/common.js';
import type {
  IAnime,
  IAnimeCharacter,
  IAnimeEpisode,
  IAnimeStaff,
  IAnimeStats,
  IAnimeThemes,
  IGenre,
} from '../../types/mal';

const animeCharactersBtn = (isDisable: boolean) =>
  new ButtonBuilder()
    .setLabel('👤 Characters')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('animeCharacters')
    .setDisabled(isDisable);

const animeEpisodesBtn = (isDisable: boolean, hasManyEpisode?: boolean) =>
  new ButtonBuilder()
    .setLabel('🎞 Episodes')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('animeEpisodes')
    .setDisabled(isDisable || !hasManyEpisode);

const animeThemesBtn = (isDisable: boolean) =>
  new ButtonBuilder()
    .setLabel('🎼 Themes')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('animeThemes')
    .setDisabled(isDisable);

const animeStatisticsBtn = (isDisable: boolean) =>
  new ButtonBuilder()
    .setLabel('📊 Statistics')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('animeStatistics')
    .setDisabled(isDisable);

const animeStaffBtn = (isDisable: boolean) =>
  new ButtonBuilder()
    .setLabel('👥 Staff')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('animeStaff')
    .setDisabled(isDisable);

const animeRow = (isDisable: boolean = false, hasManyEpisode?: boolean) =>
  new ActionRowBuilder<MessageActionRowComponentBuilder>()
    .addComponents(animeCharactersBtn(isDisable))
    .addComponents(animeEpisodesBtn(isDisable, hasManyEpisode))
    .addComponents(animeThemesBtn(isDisable))
    .addComponents(animeStaffBtn(isDisable))
    .addComponents(animeStatisticsBtn(isDisable));

@Discord()
@SlashGroup({ description: 'MyAnimeList commands', name: 'mal' })
@SlashGroup({ description: 'Anime commands', name: 'anime', root: 'mal' })
export class MAL_Anime {
  @Slash({ description: 'Search MAL anime' })
  @SlashGroup('anime', 'mal')
  async search(
    @SlashOption({
      description: 'Public display?',
      name: 'display',
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    display: Boolean,
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
      description: 'Query to search',
      name: 'query',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    q: String,
    @SlashChoice(...MALConstants.ANIME_QUERY_TYPE)
    @SlashOption({
      description: 'Select type',
      name: 'type',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    type: String,
    @SlashChoice(...MALConstants.ANIME_QUERY_STATUS)
    @SlashOption({
      description: 'Select status',
      name: 'status',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    status: String,
    @SlashChoice(...MALConstants.ANIME_QUERY_RATING)
    @SlashOption({
      description: 'Select rating',
      name: 'rating',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    rating: String,
    @SlashChoice(...MALConstants.ANIME_QUERY_ORDER_BY)
    @SlashOption({
      description: 'Select order-by',
      name: 'order_by',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    order_by: String,
    @SlashChoice(...MALConstants.SORT)
    @SlashOption({
      description: 'Select sort',
      name: 'sort',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    sort: String,
    @SlashOption({
      description: 'Filter by genre(s) IDs. Can pass multiple with a comma as a delimiter. e.g 1,2,3',
      name: 'genres',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    genres: String,
    @SlashOption({
      description: 'Exclude genre(s) IDs. Can pass multiple with a comma as a delimiter. e.g 1,2,3',
      name: 'genres_exclude',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    genres_exclude: String,
    @SlashOption({
      description: 'Search score',
      name: 'score',
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    score: Number,
    @SlashOption({
      description: 'Search min score',
      name: 'min_score',
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    min_score: Number,
    @SlashOption({
      description: 'Search max score',
      name: 'max_score',
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    max_score: Number,
    @SlashOption({
      description: 'Is sfw?',
      name: 'sfw',
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    sfw: Boolean,
    @SlashOption({
      description: 'Starting date. Format: YYYY-MM-DD. e.g 2000, 2000-10, 2000-10-30',
      name: 'start_date',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    start_date: String,
    @SlashOption({
      description: 'Ending date. Format: YYYY-MM-DD. e.g 2000, 2000-10, 2000-10-30',
      name: 'end_date',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    end_date: String,
    interaction: CommandInteraction,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: !display });
    sfw === undefined && (sfw = true);

    let request = Object.assign(
      { sfw },
      q && { q },
      type && { type },
      status && { status },
      rating && { rating },
      order_by && { order_by },
      sort && { sort },
      score && { score },
      genres && { genres },
      genres_exclude && { genres_exclude },
      min_score && { min_score },
      max_score && { max_score },
      start_date && { start_date },
      end_date && { end_date },
    );

    const queryString = new URLSearchParams(request).toString();

    try {
      const res = await animeApi.search(queryString);
      if (res.data.data.length === 0) {
        editOrReplyThenDelete(interaction, { content: '❌ No anime found.', ephemeral: !display });
        return;
      }

      const pages = res.data.data.map((anime: IAnime, index: number) => {
        const embed = MAL_AnimeEmbed(anime, interaction.user, index + 1, res.data.data.length);
        const row = animeRow;

        return {
          embeds: [embed],
          components: [row(!anime.approved, anime.episodes > 1)],
        };
      });
      const names: string[] = res.data.data.map((anime: IAnime) =>
        anime.title.length > 100 ? `${anime.title.slice(0, 95)}...` : anime.title,
      );

      const pagination = commonPagination(interaction, pages, navigation, !display, names);

      await pagination.send();
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: `❌ ${err.message}`, ephemeral: !display });
    }
  }

  @Slash({ description: 'Get MAL anime genres' })
  @SlashGroup('anime', 'mal')
  async genres(
    @SlashOption({
      description: 'Public display?',
      name: 'display',
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    display: Boolean,
    @SlashChoice(...MALConstants.JIKAN_GENRES_FILTER)
    @SlashOption({
      description: 'Select filter',
      name: 'filter',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    filter: String,
    interaction: CommandInteraction,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: !display });
    const queryString = filter ? `filter=${filter}` : '';

    try {
      const res = await animeApi.genres(queryString);
      if (res.data.data.length === 0) {
        editOrReplyThenDelete(interaction, { content: '❌ No genres found.', ephemeral: !display });
        return;
      }

      const genres: Array<IGenre> = sortArray.desc(res.data.data, 'count');

      let genreChunks = splitToChunks(genres, MALConstants.GENRES_PER_PAGE);

      const pages = genreChunks.map((genres: Array<IGenre>, index: number) => {
        const embed = MAL_GenresEmbed(genres, interaction.user, index + 1, genreChunks.length);

        return { embeds: [embed] };
      });

      const pagination = commonPagination(interaction, pages, CommonConstants.PAGINATION_TYPE.BUTTON, !display);

      await pagination.send();
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: `❌ ${err.message}`, ephemeral: !display });
    }
  }

  @ButtonComponent({ id: 'animeCharacters' })
  async charactersBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({ ephemeral: isEphemeral });
    const mal_id = interaction.message.embeds[0].data.title?.match(MALConstants.REGEX_GET_ID)![1];

    try {
      const res = await animeApi.characters(mal_id!);
      if (res.data.data.length === 0) {
        editOrReplyThenDelete(interaction, { content: '❌ No character found.', ephemeral: isEphemeral! });
        return;
      }

      let names: string[] = [];

      const pages = res.data.data.map((animeCharacter: IAnimeCharacter, index: number) => {
        names.push(animeCharacter.character.name);
        animeCharacter.anime_mal_id = parseInt(mal_id!);
        const embed = MAL_AnimeCharacterEmbed(animeCharacter, interaction.user, index + 1, res.data.data.length);

        return {
          embeds: [embed],
        };
      });

      const pagination = commonPagination(
        interaction,
        pages,
        CommonConstants.PAGINATION_TYPE.MENU,
        isEphemeral!,
        names,
      );

      await pagination.send();
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: `❌ ${err.message}`, ephemeral: isEphemeral! });
    }
  }

  @ButtonComponent({ id: 'animeEpisodes' })
  async episodesBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({ ephemeral: isEphemeral });
    const mal_id = interaction.message.embeds[0].data.title?.match(MALConstants.REGEX_GET_ID)![1];

    try {
      const episodes: Array<IAnimeEpisode> = await animeApi.episodes(mal_id!);
      if (episodes.length === 0) {
        interaction.editReply({ content: '❌ No episode found.' });
        return;
      }

      let titles: Array<string> = [];
      let episodeChunks: Array<Array<IAnimeEpisode>> = splitToChunks(episodes, MALConstants.EPISODES_PER_PAGE);

      const pages = episodeChunks.map((episodes: Array<IAnimeEpisode>, index: number) => {
        titles.push(`Page ${index + 1}`);
        const embed = MAL_AnimeEpisodeEmbed(episodes, interaction.user, index + 1, episodeChunks.length);

        return {
          embeds: [embed],
        };
      });

      const pagination = commonPagination(
        interaction,
        pages,
        CommonConstants.PAGINATION_TYPE.MENU,
        isEphemeral!,
        titles,
      );

      await pagination.send();
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: `❌ ${err.message}`, ephemeral: isEphemeral! });
    }
  }

  @ButtonComponent({ id: 'animeThemes' })
  async themesBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({ ephemeral: isEphemeral });
    const mal_id = interaction.message.embeds[0].data.title?.match(MALConstants.REGEX_GET_ID)![1];

    try {
      const res = await animeApi.themes(mal_id!);
      const themes: IAnimeThemes = res.data.data;
      if (themes.openings.length === 0 && themes.endings.length === 0) {
        editOrReplyThenDelete(interaction, { content: '❌ No theme found.', ephemeral: isEphemeral! });
        return;
      }
      themes.anime_mal_id = parseInt(mal_id!);

      const embed = MAL_AnimeThemeEmbed(themes, interaction.user);

      editOrReplyThenDelete(interaction, { embeds: [embed], ephemeral: isEphemeral! });
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: `❌ ${err.message}`, ephemeral: isEphemeral! });
    }
  }

  @ButtonComponent({ id: 'animeStaff' })
  async staffBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({ ephemeral: isEphemeral });
    const mal_id = interaction.message.embeds[0].data.title?.match(MALConstants.REGEX_GET_ID)![1];

    try {
      const res = await animeApi.staff(mal_id!);
      if (res.data.data.length === 0) {
        editOrReplyThenDelete(interaction, { content: '❌ No staff found.', ephemeral: isEphemeral! });
        return;
      }

      let names: string[] = [];

      const pages = res.data.data.map((animeStaff: IAnimeStaff, index: number) => {
        names.push(animeStaff.person.name);
        const embed = MAL_AnimeStaffEmbed(animeStaff, interaction.user, index + 1, res.data.data.length);

        return {
          embeds: [embed],
        };
      });

      const pagination = commonPagination(
        interaction,
        pages,
        CommonConstants.PAGINATION_TYPE.MENU,
        isEphemeral!,
        names,
      );

      await pagination.send();
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: `❌ ${err.message}`, ephemeral: isEphemeral! });
    }
  }

  @ButtonComponent({ id: 'animeStatistics' })
  async statisticsBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({ ephemeral: isEphemeral });
    const mal_id = interaction.message.embeds[0].data.title?.match(MALConstants.REGEX_GET_ID)![1];

    try {
      const res = await animeApi.statistics(mal_id!);
      const resStatistics: IAnimeStats = res.data.data;

      const overAllStat = {
        watching: resStatistics.watching,
        completed: resStatistics.completed,
        on_hold: resStatistics.on_hold,
        dropped: resStatistics.dropped,
        plan_to_watch: resStatistics.plan_to_watch,
        total: resStatistics.total,
      };

      const chartConfigs = {
        type: 'doughnut',
        data: {
          labels: resStatistics.scores.map((score: any) => score.score),
          datasets: [
            {
              data: resStatistics.scores.map((score: any) => score.votes),
              percentage: resStatistics.scores.map((score: any) => score.percentage),
            },
          ],
        },
        options: {
          plugins: {
            doughnutlabel: {
              labels: [{ text: resStatistics.total, font: { size: 20 } }, { text: 'Total votes' }],
            },
            datalabels: {
              formatter: (value: string, context: any) => {
                const p = context.chart.data.datasets[0].percentage[context.dataIndex];
                if (p < 5) return '';
                return p + '%';
              },
            },
          },
        },
      };

      const chart = createChart(chartConfigs, CommonConstants.CHART_WIDTH, CommonConstants.CHART_HEIGHT);

      const statistics = {
        overAllStat,
        chart,
        mal_id,
      };

      const embed = MAL_AnimeStatisticsEmbed(statistics, interaction.user);

      interaction.editReply({ embeds: [embed]! });
    } catch (err: any) {
      console.log(err as Error);
      interaction.editReply({ content: `❌ ${err.message}` });
    }
  }
}
