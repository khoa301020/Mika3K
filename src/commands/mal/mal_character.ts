import type { CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { MALConstants } from '../../constants/mal.js';
import { MAL_CharacterEmbed } from '../../providers/embeds/malEmbed.js';
import { MAL_ButtonPagination, MAL_SelectMenuPagination } from '../../providers/paginations/malPagination.js';
import { characterApi } from '../../services/mal.js';
import type { ICharacter } from '../../types/mal';

@Discord()
@SlashGroup({ description: 'MyAnimeList commands', name: 'mal' })
@SlashGroup({ description: 'Character commands', name: 'character', root: 'mal' })
export class MAL_Character {
  @Slash({ description: 'Search MAL character' })
  @SlashGroup('character', 'mal')
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
    @SlashChoice(...MALConstants.CHARACTER_QUERY_ORDER_BY)
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
      const res = await characterApi.search(queryString);

      if (res.data.data.length === 0) {
        interaction.reply({ content: 'No character found.', ephemeral: !display });
        return;
      }

      let names: string[] = [];

      const pages = res.data.data.map((character: ICharacter, index: number) => {
        names.push(character.name);
        const embed = MAL_CharacterEmbed(character, interaction.user, index + 1, res.data.data.length);

        return { embeds: [embed], name: character.name, ephemeral: !display };
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
}
