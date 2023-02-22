import axios from 'axios';
import type { CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { Constants } from '../../constants/constants.js';
import { MAL_PeopleEmbed } from '../../providers/embeds/malEmbed.js';
import { MAL_ButtonPagination, MAL_SelectMenuPagination } from '../../providers/paginations/malPagination.js';
import type { IPeople } from '../../types/mal';

@Discord()
@SlashGroup({ description: 'mal-commands', name: 'mal' })
@SlashGroup({ description: 'mal-people', name: 'people', root: 'mal' })
export class MAL_People {
  @Slash({ description: 'Search MAL people' })
  @SlashGroup('people', 'mal')
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
    @SlashChoice(...Constants.PEOPLE_QUERY_ORDER_BY)
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
    interaction: CommandInteraction,
  ): void {
    let request: any = Object.assign(q && { q }, order_by && { order_by }, sort && { sort });

    const queryString = new URLSearchParams(request).toString();
    const queryUrl = `${Constants.JIKAN_PEOPLE_SEARCH}?${queryString}`;
    console.log(queryUrl);

    axios
      .get(queryUrl)
      .then(async (res) => {
        if (res.data.data.length === 0) {
          interaction.reply({ content: 'No people found.', ephemeral: !display });
          return;
        }

        let names: string[] = [];

        const pages = res.data.data.map((people: IPeople, index: number) => {
          names.push(people.name);
          const embed = MAL_PeopleEmbed(people, interaction.user, index + 1, res.data.data.length);

          return { embeds: [embed], name: people.name, ephemeral: !display };
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
