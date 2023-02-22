import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  MessageActionRowComponentBuilder,
} from 'discord.js';
import { ButtonComponent, Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { Constants } from '../../constants/constants.js';
import { sortArray, splitToChunks } from '../../helpers/helper.js';
import { MAL_AnimeCharacterEmbed, MAL_AnimeEmbed, MAL_GenresEmbed } from '../../providers/embeds/malEmbed.js';
import { MAL_ButtonPagination, MAL_SelectMenuPagination } from '../../providers/paginations/malPagination.js';
import { animeApi } from '../../services/mal.js';
import type { IAnime, IGenre } from '../../types/mal';

const episodesBtn = new ButtonBuilder().setLabel('🎞 Episodes').setStyle(ButtonStyle.Primary).setCustomId('episodes');
const charactersBtn = new ButtonBuilder()
  .setLabel('👤 Characters')
  .setStyle(ButtonStyle.Primary)
  .setCustomId('characters');
const picturesBtn = new ButtonBuilder().setLabel('🖼 Pictures').setStyle(ButtonStyle.Primary).setCustomId('pictures');
const statisticsBtn = new ButtonBuilder()
  .setLabel('📊 Statistics')
  .setStyle(ButtonStyle.Primary)
  .setCustomId('statistics');
const staffBtn = new ButtonBuilder().setLabel('👥 Staff').setStyle(ButtonStyle.Primary).setCustomId('staff');

const animeRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
  .addComponents(charactersBtn)
  .addComponents(episodesBtn)
  .addComponents(staffBtn)
  .addComponents(picturesBtn)
  .addComponents(statisticsBtn);
// const finishRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(restartBtn);

@Discord()
@SlashGroup({ description: 'mal-commands', name: 'mal' })
@SlashGroup({ description: 'mal-anime', name: 'anime', root: 'mal' })
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
    @SlashChoice(...Constants.ANIME_QUERY_TYPE)
    @SlashOption({
      description: 'Select type',
      name: 'type',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    type: String,
    @SlashChoice(...Constants.ANIME_QUERY_STATUS)
    @SlashOption({
      description: 'Select status',
      name: 'status',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    status: String,
    @SlashChoice(...Constants.ANIME_QUERY_RATING)
    @SlashOption({
      description: 'Select rating',
      name: 'rating',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    rating: String,
    @SlashChoice(...Constants.ANIME_QUERY_ORDER_BY)
    @SlashOption({
      description: 'Select order-by',
      name: 'order_by',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    order_by: String,
    @SlashChoice(...Constants.SORT)
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
        interaction.reply({ content: 'No anime found.', ephemeral: !display });
        return;
      }

      let names: string[] = [];

      const pages = res.data.data.map((anime: IAnime, index: number) => {
        names.push(anime.title);
        const embed = MAL_AnimeEmbed(anime, interaction.user, index + 1, res.data.data.length);

        return {
          embeds: [embed],
          components: [animeRow],
          name: anime.title,
          ephemeral: !display,
        };
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
    @SlashChoice(...Constants.JIKAN_GENRES_FILTER)
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
      const res = await animeApi.genres(queryString);
      if (res.data.data.length === 0) {
        interaction.reply({ content: 'No genres found.', ephemeral: !display });
        return;
      }

      const genres: Array<IGenre> = sortArray.desc(res.data.data, 'count');

      let genreChunks = splitToChunks(genres, Constants.QUOTES_PER_PAGE);

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

  @ButtonComponent({ id: 'characters' })
  async episodesBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const user = `${interaction.user.username}#${interaction.user.discriminator}`;

    const mal_id = interaction.message.embeds[0].data.title?.match(Constants.REGEX_GET_ID)![1];
    const isEphemeral = interaction.ephemeral;

    try {
      const res = await animeApi.characters(mal_id!);
      if (res.data.data.length === 0) {
        interaction.reply({ content: 'No character found.', ephemeral: isEphemeral! });
        return;
      }

      let names: string[] = [];

      const pages = res.data.data.map((animeCharacter: any, index: number) => {
        names.push(animeCharacter.character.name);
        const embed = MAL_AnimeCharacterEmbed(animeCharacter, interaction.user, index + 1, res.data.data.length);

        return {
          embeds: [embed],
          name: animeCharacter.character.name,
          ephemeral: isEphemeral,
        };
      });

      const pagination = MAL_SelectMenuPagination(interaction, pages, !isEphemeral!, names);

      await pagination.send();
    } catch (err: any) {
      console.log(err);
      interaction.reply({ content: err.message, ephemeral: isEphemeral! });
    }
  }
  @ButtonComponent({ id: 'episodes' })
  async charactersBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const user = `${interaction.user.username}#${interaction.user.discriminator}`;

    const id = interaction.message.embeds[0].data.title?.match(Constants.REGEX_GET_ID)![1];

    // interaction.reply({ content: `[${id}] Episodes button clicked`, ephemeral: true });
  }
  @ButtonComponent({ id: 'pictures' })
  async picturesBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const user = `${interaction.user.username}#${interaction.user.discriminator}`;

    // interaction.reply({ content: 'Pictures button clicked', ephemeral: true });
  }
  @ButtonComponent({ id: 'statistics' })
  async statisticsBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const user = `${interaction.user.username}#${interaction.user.discriminator}`;

    // interaction.reply({ content: 'Statistics button clicked', ephemeral: true });
  }
  @ButtonComponent({ id: 'staff' })
  async staffBtnComponent(interaction: ButtonInteraction): Promise<void> {
    const user = `${interaction.user.username}#${interaction.user.discriminator}`;

    // interaction.reply({ content: 'Staff button clicked', ephemeral: true });
  }
}
