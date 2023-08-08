import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  MessageActionRowComponentBuilder,
} from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import qs from 'qs';
import { CommonConstants, MALConstants } from '../../constants/index.js';
import { MAL_UserAnimeEmbed, MAL_UserEmbed, MAL_UserMangaEmbed } from '../../providers/embeds/malEmbed.js';
import { commonPagination } from '../../providers/pagination.js';
import { authApi, userApi } from '../../services/mal.js';
import { TPaginationType } from '../../types/common.js';
import { IUser, IUserAnime, IUserManga } from '../../types/mal.js';
import { codeChallenge, createChart, datetimeConverter, editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
@SlashGroup({ description: 'MyAnimeList commands', name: 'mal' })
@SlashGroup({ description: 'User commands', name: 'user', root: 'mal' })
export class MAL_User {
  @SlashGroup('user', 'mal')
  @Slash({ description: 'Login MAL', name: 'login' })
  async login(interaction: CommandInteraction): Promise<any> {
    const userId = interaction.user.id;
    const PKCE = codeChallenge;
    const clientId = process.env.MAL_CLIENT_ID;
    const state = `${interaction.guildId}_${interaction.user.id}`;

    const data = {
      client_id: clientId,
      response_type: 'code',
      state: state,
      code_challenge: PKCE,
      redirect_uri: process.env.MAL_CALLBACK_URL,
    };

    const authUrl = `${MALConstants.MAL_AUTH_API}/authorize?${qs.stringify(data)}`;

    const authBtn = new ButtonBuilder().setLabel('Authorization URL').setStyle(ButtonStyle.Link).setURL(authUrl);

    const authRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(authBtn);

    await authApi.savePKCE(userId!, PKCE);

    return interaction.reply({ content: 'Please authorize:', components: [authRow], ephemeral: true });
  }
  @SlashGroup('user', 'mal')
  @Slash({ description: 'Refresh my access token', name: 'refresh-token' })
  async refreshToken(interaction: CommandInteraction): Promise<any> {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;

    const refreshedUser = await authApi.refreshToken(userId!);

    if (!refreshedUser)
      return editOrReplyThenDelete(interaction, { content: '❌ User invalid or your token is still valid.' });

    return interaction.editReply({
      content: `Token refreshed. Your login session will expire at : **${
        datetimeConverter(refreshedUser.expiresAt!).datetime
      } (UTC)**`,
    });
  }
  @SlashGroup('user', 'mal')
  @Slash({ description: 'MAL my info', name: 'my-info' })
  async myinfo(
    @SlashOption({
      description: 'Public display?',
      name: 'display',
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    display: Boolean,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply({ ephemeral: !display });
    const userId = interaction.user.id;

    const user = await authApi.checkAuthorized(userId);

    if (!user)
      return editOrReplyThenDelete(interaction, {
        content: '❌ Your login session is expired or not authorized.\nPlease login.',
      });

    const response = await userApi.getSelf(user.accessToken!);
    const userData: IUser = response.data;

    const chartConfigs = {
      type: 'doughnut',
      data: {
        labels: ['Watching', 'Completed', 'On hold', 'Dropped', 'Plan to watch'],
        datasets: [
          {
            data: [
              userData.anime_statistics?.num_items_watching,
              userData.anime_statistics?.num_items_completed,
              userData.anime_statistics?.num_items_on_hold,
              userData.anime_statistics?.num_items_dropped,
              userData.anime_statistics?.num_items_plan_to_watch,
            ],
            total: userData.anime_statistics?.num_items,
          },
        ],
      },
      options: {
        plugins: {
          doughnutlabel: {
            labels: [
              { text: userData.anime_statistics?.num_items.toString(), font: { size: 20 } },
              { text: 'Total animes' },
            ],
          },
          datalabels: {
            formatter: (value: string, context: any) => {
              const p =
                (context.chart.data.datasets[0].data[context.dataIndex] / context.chart.data.datasets[0].total!) * 100;
              if (p < 5) return '';
              return p.toFixed(2) + '%';
            },
          },
        },
      },
    };

    const chart = userData.anime_statistics?.num_items
      ? createChart(chartConfigs, CommonConstants.CHART_WIDTH, CommonConstants.CHART_HEIGHT)
      : undefined;

    const embed = MAL_UserEmbed(userData, interaction.user, chart);

    return interaction.editReply({ embeds: [embed] });
  }

  @Slash({ description: 'Check my anime list', name: 'my-anime-list' })
  @SlashGroup('user', 'mal')
  async animeList(
    @SlashOption({
      description: 'Public display?',
      name: 'display',
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    display: boolean,
    @SlashChoice({ name: 'Button navigation', value: CommonConstants.PAGINATION_TYPE.BUTTON })
    @SlashChoice({ name: 'Select menu', value: CommonConstants.PAGINATION_TYPE.MENU })
    @SlashOption({
      description: 'Navigation type',
      name: 'navigation',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    navigation: TPaginationType,
    @SlashChoice(...MALConstants.MY_ANIME_SEARCH_STATUS)
    @SlashOption({
      description: 'Select status',
      name: 'status',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    status: string,
    @SlashChoice(...MALConstants.MY_ANIME_SEARCH_SORT)
    @SlashOption({
      description: 'Select sort',
      name: 'sort',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    sort: string,
    @SlashOption({
      description: 'Select result limit (default: 10, max: 1000)',
      name: 'limit',
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    limit: number,
    interaction: CommandInteraction,
  ): Promise<any> {
    const userId = interaction.user.id;
    if (limit < 1 || limit > 1000)
      return editOrReplyThenDelete(interaction, { content: 'Limit must be between 1 and 1000' });
    let params = Object.assign({ fields: 'list_status' }, status && { status }, sort && { sort }, limit && { limit });

    try {
      const res = await userApi.getMyAnimeList(userId, params);
      const userAnimeList: Array<IUserAnime> = res.data.data;
      if (userAnimeList.length === 0) {
        return editOrReplyThenDelete(interaction, { content: 'No anime found.', ephemeral: !display });
      }

      let names: string[] = [];

      const pages = userAnimeList.map((anime: IUserAnime, index: number) => {
        names.push(anime.node.title);
        const embed = MAL_UserAnimeEmbed(anime, interaction.user, index + 1, res.data.data.length);

        return {
          embeds: [embed],
        };
      });

      const pagination = commonPagination(interaction, pages, navigation, !display, names);

      await pagination.send();
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: err.message, ephemeral: !display });
    }
  }
  @Slash({ description: 'Check my manga list', name: 'my-manga-list' })
  @SlashGroup('user', 'mal')
  async mangaList(
    @SlashOption({
      description: 'Public display?',
      name: 'display',
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    display: boolean,
    @SlashChoice({ name: 'Button navigation', value: CommonConstants.PAGINATION_TYPE.BUTTON })
    @SlashChoice({ name: 'Select menu', value: CommonConstants.PAGINATION_TYPE.MENU })
    @SlashOption({
      description: 'Navigation type',
      name: 'navigation',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    navigation: TPaginationType,
    @SlashChoice(...MALConstants.MY_MANGA_SEARCH_STATUS)
    @SlashOption({
      description: 'Select status',
      name: 'status',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    status: string,
    @SlashChoice(...MALConstants.MY_MANGA_SEARCH_SORT)
    @SlashOption({
      description: 'Select sort',
      name: 'sort',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    sort: string,
    @SlashOption({
      description: 'Select result limit (default: 10, max: 1000)',
      name: 'limit',
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    limit: number,
    interaction: CommandInteraction,
  ): Promise<any> {
    const userId = interaction.user.id;
    if (limit < 1 || limit > 1000)
      return editOrReplyThenDelete(interaction, { content: 'Limit must be between 1 and 1000' });
    let params = Object.assign({ fields: 'list_status' }, status && { status }, sort && { sort }, limit && { limit });

    try {
      const res = await userApi.getMyMangaList(userId, params);
      const userMangaList: Array<IUserManga> = res.data.data;
      if (userMangaList.length === 0) {
        return editOrReplyThenDelete(interaction, { content: 'No manga found.', ephemeral: !display });
      }

      let names: string[] = [];

      const pages = userMangaList.map((manga: IUserManga, index: number) => {
        names.push(manga.node.title);
        const embed = MAL_UserMangaEmbed(manga, interaction.user, index + 1, res.data.data.length);

        return {
          embeds: [embed],
        };
      });

      const pagination = commonPagination(interaction, pages, navigation, !display, names);

      await pagination.send();
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: err.message, ephemeral: !display });
    }
  }
}
