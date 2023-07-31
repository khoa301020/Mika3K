import { ApplicationCommandOptionType, CommandInteraction, TextChannel } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { CommonConstants, NHentaiConstants } from '../../constants/index.js';
import { NHentaiListEmbed } from '../../providers/embeds/nhentaiEmbed.js';
import { commonPagination } from '../../providers/pagination.js';
import { queryBuilder, simulateNHentaiRequest } from '../../services/nhentai.js';
import { INHentaiModulesResult, INHentaiQueryParam, INHentaiQuerySort } from '../../types/nhentai.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@SlashGroup({ description: 'NHentai commands', name: 'nhentai' })
@Discord()
class SearchNHentai {
  @SlashGroup('nhentai')
  @Slash({ description: 'Search NHentai', name: 'search' })
  async searchNHentaiSlash(
    @SlashOption({
      description: 'Keyword',
      name: 'keyword',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    keyword: String = '+ ',
    @SlashOption({
      description: 'Tag filter, use "|" to split multiple tags, use "-" to exclude tag',
      name: 'tag',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    tags: String,
    @SlashOption({
      description: 'Artist filter, use "|" to split multiple artists, use "-" to exclude artist',
      name: 'artist',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    artist: String,
    @SlashOption({
      description: 'Character filter, use "|" to split multiple characters, use "-" to exclude character',
      name: 'character',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    character: String,
    @SlashOption({
      description: 'Parody filter, use "|" to split multiple parodies, use "-" to exclude parody',
      name: 'parody',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    parody: String,
    @SlashOption({
      description: 'Group filter, use "|" to split multiple groups, use "-" to exclude group',
      name: 'group',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    group: String,
    @SlashOption({
      description: 'Language filter, use "|" to split multiple languages, use "-" to exclude language',
      name: 'language',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    language: String,
    @SlashOption({
      description: 'Category filter, use "|" to split multiple categories, use "-" to exclude category',
      name: 'category',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    category: String,
    @SlashOption({
      description: 'Page number, default to 1',
      name: 'page',
      required: false,
      type: ApplicationCommandOptionType.Integer,
    })
    page: number = 1,
    @SlashChoice(...NHentaiConstants.NHENTAI_SORT_ARGS.map((e) => ({ name: e.toUpperCase(), value: e })))
    @SlashOption({
      description: 'Sort by recent or popularity, default to popular',
      name: 'sort',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    sort: INHentaiQuerySort = 'popular',
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply({ ephemeral: !(interaction.channel as TextChannel)?.nsfw ?? true });

    const query: INHentaiQueryParam = {
      tag: tags?.toString().split('|'),
      artist: artist?.toString().split('|'),
      character: character?.toString().split('|'),
      parody: parody?.toString().split('|'),
      group: group?.toString().split('|'),
      language: language?.toString().split('|'),
      category: category?.toString().split('|'),
    };

    const queryString = `${keyword.trim() + queryBuilder(query).trim()}&sort=${sort}&pages=${page}`;

    const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_SEARCH_ENDPOINT(queryString));

    console.log(res.config.url);
    if (!res.data || res.data.status !== 200) return await interaction.editReply({ content: '❌ No result found' });
    const list: Array<INHentaiModulesResult> = res.data.data.result;
    const pages = list.map((book: INHentaiModulesResult, index: number) => {
      book.total_search_page = res.data.num_pages;
      book.current_search_page = page;
      const embed = NHentaiListEmbed(book, interaction.user, index + 1, list.length);
      return {
        embeds: [embed],
      };
    });
    const titles = list.map((book: INHentaiModulesResult) => book.title.pretty);
    const pagination = commonPagination(
      interaction,
      pages,
      CommonConstants.PAGINATION_TYPE.BUTTON,
      interaction.ephemeral ?? false,
      titles,
    );

    return await pagination.send();
  }

  @SimpleCommand({ aliases: ['nhs', 'nhsearch'], description: 'Search NHentai' })
  async searchNHentaiCommand(command: SimpleCommandMessage): Promise<any> {
    if (!(command.message.channel as TextChannel).nsfw)
      return await editOrReplyThenDelete(command.message, {
        content: '❌ This command can only be used in NSFW channel',
      });

    let query: string, sort: string, page: string;
    if (!command.argString) [query, sort, page] = ['+', 'popular', '1'];
    else [query, sort, page] = command.argString.split('|').map((e) => e.trim());

    const queryString = `${query.trim() === '' ? '+' : query.trim()}&sort=${sort}&pages=${page}`;

    const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_SEARCH_ENDPOINT(queryString));
    console.log(res.config.url);
    if (!res.data || res.data.status !== 200) return await editOrReplyThenDelete(command.message, '❌ No result found');

    const list: Array<INHentaiModulesResult> = res.data.data.result;
    const pages = list.map((book: INHentaiModulesResult, index: number) => {
      book.total_search_page = res.data.data.num_pages;
      book.current_search_page = parseInt(page);
      const embed = NHentaiListEmbed(book, command.message.author, index + 1, list.length);
      return {
        embeds: [embed],
      };
    });
    const titles = list.map((book: INHentaiModulesResult) => book.title.pretty);
    const pagination = commonPagination(command, pages, 'button', false, titles);

    return await pagination.send();
  }
}
