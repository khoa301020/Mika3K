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
import { MALConstants } from '../../constants/index.js';
import { createChart, sortArray, splitToChunks } from '../../helpers/helper.js';
import {
  MAL_GenresEmbed,
  MAL_MangaCharacterEmbed,
  MAL_MangaEmbed,
  MAL_MangaStatisticsEmbed,
} from '../../providers/embeds/malEmbed.js';
import { MAL_ButtonPagination, MAL_SelectMenuPagination } from '../../providers/paginations/malPagination.js';
import { mangaApi } from '../../services/mal.js';
import type { IGenre, IManga, IMangaStats } from '../../types/mal';

const mangaCharactersBtn = new ButtonBuilder()
  .setLabel('👤 Characters')
  .setStyle(ButtonStyle.Primary)
  .setCustomId('mangaCharacters');
const mangaStatisticsBtn = new ButtonBuilder()
  .setLabel('📊 Statistics')
  .setStyle(ButtonStyle.Primary)
  .setCustomId('mangaStatistics');
const mangaRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
  .addComponents(mangaCharactersBtn)

  .addComponents(mangaStatisticsBtn);
@Discord()
@SlashGroup({ description: 'MyAnimeList commands', name: 'mal' })
@SlashGroup({ description: 'Manga commands', name: 'manga', root: 'mal' })
export class MAL_Manga {
  @Slash({ description: 'Search MAL manga' })
  @SlashGroup('manga', 'mal')
  async search(
    @SlashOption({
      description: 'Public display?',
      name: 'display',
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    display: Boolean,
    @SlashChoice({ name: 'Button navigation', value: 'button' })
    @SlashChoice({ name: 'Select menu', value: 'select-menu' })
    @SlashOption({
      description: 'Navigation type',
      name: 'navigation',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    navigation: String,
    @SlashOption({
      description: 'Query to search',
      name: 'query',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    q: String,
    @SlashChoice(...MALConstants.MANGA_QUERY_TYPE)
    @SlashOption({
      description: 'Select type',
      name: 'type',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    type: String,
    @SlashChoice(...MALConstants.MANGA_QUERY_STATUS)
    @SlashOption({
      description: 'Select status',
      name: 'status',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    status: String,
    @SlashChoice(...MALConstants.MANGA_QUERY_ORDER_BY)
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
    sfw === undefined && (sfw = true);

    let request = Object.assign(
      { sfw },
      q && { q },
      type && { type },
      status && { status },
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
      const res = await mangaApi.search(queryString);
      if (res.data.data.length === 0) {
        interaction.reply({ content: 'No manga found.', ephemeral: !display });
        return;
      }

      let names: string[] = [];

      const pages = res.data.data.map((manga: IManga, index: number) => {
        names.push(manga.title);
        const embed = MAL_MangaEmbed(manga, interaction.user, index + 1, res.data.data.length);

        return { embeds: [embed], components: [mangaRow] };
      });

      const pagination =
        navigation === 'button'
          ? MAL_ButtonPagination(interaction, pages, !!display)
          : MAL_SelectMenuPagination(interaction, pages, !!display, names);

      await pagination.send();
    } catch (err: any) {
      console.log(err);
      interaction.reply({ content: err.message, ephemeral: !display });
    }
  }

  @Slash({ description: 'Get MAL manga genres' })
  @SlashGroup('manga', 'mal')
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
    const queryString = filter ? `filter=${filter}` : '';

    try {
      const res = await mangaApi.genres(queryString);
      if (res.data.data.length === 0) {
        interaction.reply({ content: 'No genres found.', ephemeral: !display });
        return;
      }

      const genres: Array<IGenre> = sortArray.desc(res.data.data, 'count');

      let genreChunks = splitToChunks(genres, MALConstants.GENRES_PER_PAGE);

      const pages = genreChunks.map((genres: Array<IGenre>, index: number) => {
        const embed = MAL_GenresEmbed(genres, interaction.user, index + 1, genreChunks.length);

        return { embeds: [embed], ephemeral: !display };
      });

      const pagination = MAL_ButtonPagination(interaction, pages, !!display);

      await pagination.send();
    } catch (err: any) {
      console.log(err);
      interaction.reply({ content: err.message, ephemeral: !display });
    }
  }

  @ButtonComponent({ id: 'mangaCharacters' })
  async charactersBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const mal_id = interaction.message.embeds[0].data.title?.match(MALConstants.REGEX_GET_ID)![1];
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);

    try {
      const res = await mangaApi.characters(mal_id!);
      if (res.data.data.length === 0) {
        interaction.reply({ content: 'No character found.', ephemeral: isEphemeral! });
        return;
      }

      let names: string[] = [];

      const pages = res.data.data.map((mangaCharacter: any, index: number) => {
        names.push(mangaCharacter.character.name);
        mangaCharacter.mal_id = mal_id;
        const embed = MAL_MangaCharacterEmbed(mangaCharacter, interaction.user, index + 1, res.data.data.length);

        return {
          embeds: [embed],
        };
      });

      const pagination = MAL_SelectMenuPagination(interaction, pages, !isEphemeral!, names);

      await pagination.send();
    } catch (err: any) {
      console.log(err);
      interaction.reply({ content: err.message, ephemeral: isEphemeral! });
    }
  }

  @ButtonComponent({ id: 'mangaStatistics' })
  async statisticsBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const isEphemeral = interaction.message.flags.has(MessageFlags.Ephemeral);
    await interaction.deferReply({ ephemeral: isEphemeral });
    const mal_id = interaction.message.embeds[0].data.title?.match(MALConstants.REGEX_GET_ID)![1];

    try {
      const res = await mangaApi.statistics(mal_id!);
      const resStatistics: IMangaStats = res.data.data;

      const overAllStat = {
        reading: resStatistics.reading,
        completed: resStatistics.completed,
        on_hold: resStatistics.on_hold,
        dropped: resStatistics.dropped,
        plan_to_read: resStatistics.plan_to_read,
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

      const chart = createChart(chartConfigs, 800, 400);

      const statistics = {
        overAllStat,
        chart,
        mal_id,
      };

      const embed = MAL_MangaStatisticsEmbed(statistics, interaction.user);

      interaction.editReply({ embeds: [embed]! });
    } catch (err: any) {
      console.log(err);
      interaction.editReply({ content: err.message });
    }
  }
}
