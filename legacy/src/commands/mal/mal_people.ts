import type { CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { CommonConstants, MALConstants } from '../../constants/index.js';
import { MAL_PeopleEmbed } from '../../providers/embeds/malEmbed.js';
import { commonPagination } from '../../providers/pagination.js';
import { peopleApi } from '../../services/mal.js';
import { TPaginationType } from '../../types/common.js';
import type { IPeople } from '../../types/mal';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
@SlashGroup({ description: 'MyAnimeList commands', name: 'mal' })
@SlashGroup({ description: 'People commands', name: 'people', root: 'mal' })
export class MAL_People {
  @Slash({ description: 'Search MAL people' })
  @SlashGroup('people', 'mal')
  async search(
    @SlashOption({
      description: 'Public display?',
      name: 'display',
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    display: Boolean,
    @SlashChoice({ name: 'Button navigation', value: CommonConstants.PAGINATION_TYPE.BUTTON })
    @SlashChoice({ name: 'Select menu', value: CommonConstants.PAGINATION_TYPE.MENU })
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
    @SlashChoice(...MALConstants.PEOPLE_QUERY_ORDER_BY)
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
    interaction: CommandInteraction,
  ): Promise<void> {
    let request: any = Object.assign(q && { q }, order_by && { order_by }, sort && { sort });

    const queryString = new URLSearchParams(request).toString();

    try {
      const res = await peopleApi.search(queryString);

      if (res.data.data.length === 0) {
        editOrReplyThenDelete(interaction, { content: 'No people found.', ephemeral: !display });
        return;
      }

      let names: string[] = [];

      const pages = res.data.data.map((people: IPeople, index: number) => {
        names.push(people.name.length > 100 ? `${people.name.slice(0, 95)}...` : people.name);
        const embed = MAL_PeopleEmbed(people, interaction.user, index + 1, res.data.data.length);

        return { embeds: [embed], name: people.name, ephemeral: !display };
      });

      const pagination = commonPagination(interaction, pages, navigation, !display, names);

      await pagination.send();
    } catch (err: any) {
      console.log(err);
      editOrReplyThenDelete(interaction, { content: err.message, ephemeral: !display });
    }
  }
}
