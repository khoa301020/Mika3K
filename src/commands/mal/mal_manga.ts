import axios from 'axios';
import type { CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { Constants } from '../../constants/constants.js';
import { MAL_MangaEmbed } from '../../providers/embeds/malEmbed.js';
import { MAL_ButtonPagination, MAL_SelectMenuPagination } from '../../providers/paginations/malPagination.js';
import type { IManga } from '../../types/mal';

@Discord()
@SlashGroup({ description: 'mal-commands', name: 'mal' })
@SlashGroup({ description: 'mal-manga', name: 'manga', root: 'mal' })
export class MAL_Manga {
  @Slash({ description: 'Search MAL manga' })
  @SlashGroup('manga', 'mal')
  search(
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
    @SlashChoice(...Constants.MANGA_QUERY_TYPE)
    @SlashOption({
      description: 'Select type',
      name: 'type',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    type: String,
    @SlashChoice(...Constants.MANGA_QUERY_STATUS)
    @SlashOption({
      description: 'Select status',
      name: 'status',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    status: String,
    @SlashChoice(...Constants.MANGA_QUERY_ORDER_BY)
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
  ): void {
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
    const queryUrl = `${Constants.JIKAN_MANGA_SEARCH}?${queryString}`;
    console.log(queryUrl);

    axios
      .get(queryUrl)
      .then(async (res) => {
        if (res.data.data.length === 0) {
          interaction.reply({ content: 'No manga found.', ephemeral: !display });
          return;
        }

        let names: string[] = [];

        const pages = res.data.data.map((manga: IManga, index: number) => {
          names.push(manga.title);
          const embed = MAL_MangaEmbed(manga, interaction.user, index + 1, res.data.data.length);

          return { embeds: [embed], name: manga.title, ephemeral: !display };
        });

        switch (navigation) {
          case 'button':
            {
              const pagination = MAL_ButtonPagination(interaction, pages, !!display);
              await pagination.send();
            }
            break;
          case 'select-menu':
            {
              const pagination = MAL_SelectMenuPagination(interaction, pages, !!display, names);
              await pagination.send();
            }
            break;

          default:
            interaction.reply({ content: 'Invalid navigation type', ephemeral: !display });
            break;
        }
      })
      .catch((err) => {
        console.log(err);
        interaction.reply({ content: err.message, ephemeral: !display });
      });
  }
}
