import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CommandInteraction,
  Message,
  MessageContextMenuCommandInteraction,
  TextChannel,
} from 'discord.js';
import {
  ContextMenu,
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  Slash,
  SlashChoice,
  SlashGroup,
  SlashOption,
} from 'discordx';
import { CommonConstants, NHentaiConstants } from '../../constants/index.js';
import { NHentaiEmbed } from '../../providers/embeds/nhentaiEmbed.js';
import { commonPagination } from '../../providers/pagination.js';
import { queryBuilder, simulateNHentaiRequest } from '../../services/nhentai.js';
import { INHentai, INHentaiQueryParam, INHentaiQuerySort } from '../../types/nhentai.js';
import { editOrReplyThenDelete, timeout } from '../../utils/index.js';
import CheckNHentaiCode from './nh_check.js';

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
    page: number = NHentaiConstants.NHENTAI_DEFAULT_PAGE,
    @SlashChoice(...NHentaiConstants.NHENTAI_SORT_ARGS.map((e) => ({ name: e.toUpperCase(), value: e })))
    @SlashOption({
      description: 'Sort by recent or popularity, default to popular',
      name: 'sort',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    sort: INHentaiQuerySort = NHentaiConstants.NHENTAI_DEFAULT_SORT,
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

    const queryString = `${keyword.trim() + queryBuilder(query)}&sort=${sort}&page=${page}`;

    try {
      const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_SEARCH_ENDPOINT(queryString));

      console.log(res.config.url);
      if (!res.data || res.data.result.length === 0)
        return await editOrReplyThenDelete(interaction, { content: '❌ No result found' });
      const list: Array<INHentai> = res.data.result;
      const pages = list.map((book: INHentai, index: number) => {
        book.total_search_page = res.data.num_pages;
        book.current_search_page = page;
        const embed = NHentaiEmbed(book, interaction.user, index + 1, list.length);
        return {
          embeds: [embed],
        };
      });
      const titles = list.map((book: INHentai) => book.title.pretty);
      const pagination = commonPagination(
        interaction,
        pages,
        CommonConstants.PAGINATION_TYPE.BUTTON,
        interaction.ephemeral ?? false,
        titles,
      );

      return await pagination.send();
    } catch (err: any) {
      await editOrReplyThenDelete(interaction, { content: err.message });
      throw err;
    }
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

    sort = sort ?? NHentaiConstants.NHENTAI_DEFAULT_SORT;
    page = page ?? NHentaiConstants.NHENTAI_DEFAULT_PAGE;
    query = query.trim() ?? NHentaiConstants.NHENTAI_DEFAULT_QUERY;
    query = query
      .replace(/<a?:.+?:\d+>/g, '') // remove all emojis
      .replace(/<@!?\d+>/g, '') // remove all mentions
      .replace(/https?:\/\/\S+/g, ''); // remove all links (both http and https)

    const codes: Array<string> | null = query.match(/(?<!\d)\d{6}(?!\d)/g);
    if (codes && codes.length > 0) return new CheckNHentaiCode().checkCodeCommand(query, command);

    const queryString = `${encodeURIComponent(query.toLowerCase())}&sort=${sort}&page=${page}`;

    try {
      const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_SEARCH_ENDPOINT(queryString));
      console.log(res.config.url);
      if (!res.data || res.data.result.length === 0)
        return await editOrReplyThenDelete(command.message, '❌ No result found');

      const list: Array<INHentai> = res.data.result;
      const pages = list.map((book: INHentai, index: number) => {
        book.total_search_page = res.data.num_pages;
        book.current_search_page = parseInt(page);
        const embed = NHentaiEmbed(book, command.message.author, index + 1, list.length);
        return {
          embeds: [embed],
        };
      });

      const titles = list.map((book: INHentai) => book.title.pretty);
      const pagination = commonPagination(command, pages, 'button', false, titles);

      return await pagination.send();
    } catch (err: any) {
      await editOrReplyThenDelete(command.message, { content: err.message });
      throw err;
    }
  }

  @ContextMenu({
    name: 'Search NHentai',
    type: ApplicationCommandType.Message,
  })
  async checkCodeContextMenu(interaction: MessageContextMenuCommandInteraction): Promise<any> {
    await interaction.deferReply({ ephemeral: !(interaction.channel as TextChannel)?.nsfw });
    const message: Message = await (interaction.channel as TextChannel).messages.fetch(interaction.targetId);

    const query = `${message.content} ${message.embeds.length > 0 && message.embeds.map((e) => e.title).join(' ')}`
      .replace(/<a?:.+?:\d+>/g, '') // remove all emojis
      .replace(/<@!?\d+>/g, '') // remove all mentions
      .replace(/https?:\/\/\S+/g, ''); // remove all links (both http and https)

    try {
      const codes: Array<string> | null = query.match(/(?<!\d)\d{6}(?!\d)/g);
      if (codes && codes.length > 0) {
        let results: Array<INHentai> = [];
        for (const code of codes) {
          const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_GALLERY_ENDPOINT(code));
          if (!res.data || res.status === 404) continue;
          results.push(res.data);
          await timeout(3333);
        }
        if (results.length === 0) return await editOrReplyThenDelete(interaction, { content: '❌ No code found' });
        if (results.length === 1) {
          const embed = NHentaiEmbed(results[0], interaction.user);
          return await interaction.editReply({ embeds: [embed] });
        } else {
          const pages = results.map((book: INHentai, index: number) => {
            const embed = NHentaiEmbed(book, interaction.user, index + 1, results.length);
            return {
              embeds: [embed],
            };
          });
          const pagination = commonPagination(interaction, pages, CommonConstants.PAGINATION_TYPE.BUTTON, false);

          return await pagination.send();
        }
      } else {
        const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_SEARCH_ENDPOINT(query));
        console.log(res.config.url);
        if (!res.data || res.data.result.length === 0)
          return await editOrReplyThenDelete(interaction, '❌ No result found');

        const list: Array<INHentai> = res.data.result;
        const pages = list.map((book: INHentai, index: number) => {
          book.total_search_page = res.data.num_pages;
          book.current_search_page = 1;
          const embed = NHentaiEmbed(book, interaction.user, index + 1, list.length);
          return {
            embeds: [embed],
          };
        });

        const titles = list.map((book: INHentai) => book.title.pretty);
        const pagination = commonPagination(interaction, pages, CommonConstants.PAGINATION_TYPE.BUTTON, false, titles);

        return await pagination.send();
      }
    } catch (err: any) {
      await editOrReplyThenDelete(interaction, { content: err.message });
      throw err;
    }
  }
}
