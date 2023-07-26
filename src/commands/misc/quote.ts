import {
  APIAttachment,
  ApplicationCommandOptionType,
  CommandInteraction,
  InteractionResponse,
  Message,
} from 'discord.js';
import {
  Client,
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
  SlashGroup,
  SlashOption,
} from 'discordx';
import { CommonConstants } from '../../constants/index.js';
import { editOrReplyThenDelete, randomArray, splitToChunks } from '../../helpers/helper.js';
import { ListQuoteEmbed } from '../../providers/embeds/commonEmbed.js';
import { commonPagination } from '../../providers/pagination.js';
import {
  createQuote,
  deleteQuote,
  editQuote,
  getListQuotes,
  getQuote,
  getUserQuotes,
  privateQuote,
  publishQuote,
} from '../../services/quote.js';
import { IUserQuote } from '../../types/quote.js';

@Discord()
@SlashGroup({ description: 'Quote commands', name: 'quote' })
class QuoteCommand {
  @SimpleCommand({ aliases: ['$', 'createquote'], description: 'Create new quote', argSplitter: ' ' })
  async createQuoteCommand(
    @SimpleCommandOption({ name: 'command', type: SimpleCommandOptionType.String })
    cmd: string,
    @SimpleCommandOption({ name: 'key', type: SimpleCommandOptionType.String })
    key: string,
    command: SimpleCommandMessage,
  ): Promise<Message<boolean>> {
    if (!key) return command.message.reply('❌ Keyword required.');

    const value = command.message.content.split(' ').slice(2).join(' ').trim();
    const attachments = command.message.attachments.map((a) => a.url).join(', ');

    if (!value && !attachments) return command.message.reply('Content required.');

    const quote: IUserQuote = {
      guild: command.message.guildId!,
      user: command.message.author.id,
      quote: {
        key: key,
        value: `${value} ${attachments}`.trim(),
      },
      createdAt: new Date(),
    };

    try {
      createQuote(quote).then((quoteResponse) => {
        if (!quoteResponse) return command.message.reply('❌ Error occured.');
      });
    } catch (error) {
      return command.message.reply('❌ Error occured.');
    }

    return command.message.reply('✅ Quote added successfully.');
  }

  @SimpleCommand({ aliases: ['$$', 'getquote'], description: 'Get quote', argSplitter: ' ' })
  async getQuoteCommand(
    @SimpleCommandOption({ name: 'command', type: SimpleCommandOptionType.String })
    cmd: string,
    @SimpleCommandOption({ name: 'key', type: SimpleCommandOptionType.String })
    key: string,
    command: SimpleCommandMessage,
  ): Promise<Message<boolean>> {
    if (!key) return command.message.reply('Keyword required.');
    const keyword = key.trim();
    const guildId = command.message.guildId;
    let quotes: IUserQuote[] = await getQuote(keyword, guildId!);
    if (quotes.length === 0) return command.message.reply('❌ No quote found.');

    quotes = quotes.filter((quote) => command.message.author.id === quote.user || quote.private === false);
    if (quotes.length === 0) return command.message.reply('❌ Quote privated.');

    return command.message.reply({ content: randomArray(quotes).quote?.value });
  }

  @SimpleCommand({ aliases: ['lq', 'listquotes'], description: 'Get list quote', argSplitter: ' ' })
  async getListQuotesCommand(command: SimpleCommandMessage): Promise<any> {
    const guildId = command.message.guildId;
    let quotes: IUserQuote[] = await getListQuotes(guildId!);

    if (quotes.length === 0) return command.message.reply('❌ No quote found.');

    let splitedQuotes = splitToChunks(quotes, CommonConstants.QUOTES_PER_PAGE);

    const pages = splitedQuotes.map((chunk: IUserQuote[], index: number) => {
      const embed = ListQuoteEmbed(
        command.message.author,
        command.message.client as Client,
        chunk,
        index + 1,
        splitedQuotes.length,
      );

      return { embeds: [embed] };
    });

    const pagination = commonPagination(command, pages, CommonConstants.PAGINATION_TYPE.BUTTON, false);
    return await pagination.send();
  }

  @SimpleCommand({ aliases: ['mq', 'myquotes'], description: 'Get list quote', argSplitter: ' ' })
  async getMyQuotesCommand(command: SimpleCommandMessage): Promise<any> {
    const user = command.message.guild!.members.cache.get(command.message.author.id);
    let quotes: IUserQuote[] = await getUserQuotes(user!);

    if (quotes.length === 0) return command.message.reply('❌ No quote found.');

    let splitedQuotes = splitToChunks(quotes, CommonConstants.QUOTES_PER_PAGE);

    const pages = splitedQuotes.map((chunk: IUserQuote[], index: number) => {
      const embed = ListQuoteEmbed(
        command.message.author,
        command.message.client as Client,
        chunk,
        index + 1,
        splitedQuotes.length,
      );

      return { embeds: [embed] };
    });

    const pagination = commonPagination(command, pages, CommonConstants.PAGINATION_TYPE.BUTTON, false);
    return await pagination.send();
  }

  @SimpleCommand({ aliases: ['plq', 'publishquote'], description: 'Publish quote', argSplitter: ' ' })
  async publishQuoteCommand(
    @SimpleCommandOption({ name: 'id', type: SimpleCommandOptionType.String })
    id: string,
    command: SimpleCommandMessage,
  ): Promise<any> {
    if (!id) return command.message.reply('❌ ID required.');

    const user = command.message.guild!.members.cache.get(command.message.author.id);

    const response = await publishQuote(user!, id);

    return command.message.reply(response);
  }

  @SimpleCommand({ aliases: ['prq', 'privatequote'], description: 'Private quote', argSplitter: ' ' })
  async privateQuoteCommand(
    @SimpleCommandOption({ name: 'id', type: SimpleCommandOptionType.String })
    id: string,
    command: SimpleCommandMessage,
  ): Promise<any> {
    const user = command.message.guild!.members.cache.get(command.message.author.id);

    const response = await privateQuote(user!, id);

    return command.message.reply(response);
  }

  @SimpleCommand({ aliases: ['eq', 'editquote'], description: 'Edit quote', argSplitter: ' ' })
  async editQuoteCommand(
    @SimpleCommandOption({ name: 'id', type: SimpleCommandOptionType.String })
    id: string,
    command: SimpleCommandMessage,
  ): Promise<any> {
    if (!id) return command.message.reply('❌ ID required.');

    const content = command.message.content.split(' ').slice(2).join(' ').trim();
    const attachments = command.message.attachments.map((a) => a.url).join(', ');

    if (!content && !attachments) return command.message.reply('Content required.');

    const user = command.message.guild!.members.cache.get(command.message.author.id);

    const response = await editQuote(user!, id, `${content} ${attachments}`.trim());

    return command.message.reply(response);
  }

  @SimpleCommand({ aliases: ['dq', 'deletequote'], description: 'Edit quote', argSplitter: ' ' })
  async deleteQuoteCommand(
    @SimpleCommandOption({ name: 'id', type: SimpleCommandOptionType.String })
    id: string,
    command: SimpleCommandMessage,
  ): Promise<any> {
    if (!id) return command.message.reply('❌ ID required.');

    const user = command.message.guild!.members.cache.get(command.message.author.id);

    const response = await deleteQuote(user!, id);

    return command.message.reply(response);
  }
}
@Discord()
class QuoteSlash {
  @Slash({ name: 'create', description: 'Create quote' })
  @SlashGroup('quote')
  async createquote(
    @SlashOption({
      description: "Quote's keyword",
      name: 'keyword',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    keyword: string,
    @SlashOption({
      description: 'Private?',
      name: 'is-private',
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    isPrivate: Boolean,
    @SlashOption({
      description: "Quote 's content",
      name: 'content',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    content: string,
    @SlashOption({
      description: "Quote 's attachment (only 1 for slash)",
      name: 'attachment',
      required: false,
      type: ApplicationCommandOptionType.Attachment,
    })
    attachment: APIAttachment,
    interaction: CommandInteraction,
  ): Promise<InteractionResponse<boolean> | void> {
    if (!content && !attachment) return editOrReplyThenDelete(interaction, '❌ Content required.');

    const quote: IUserQuote = {
      guild: interaction.guildId!,
      user: interaction.user.id,
      quote: {
        key: keyword,
        value: `${content} ${attachment ? attachment.url : ''}`.trim(),
      },
      private: isPrivate,
      createdAt: new Date(),
    };

    try {
      createQuote(quote).then((quoteResponse) => {
        if (!quoteResponse)
          return editOrReplyThenDelete(interaction, { content: '❌ Error occured.', ephemeral: true });
      });
    } catch (error) {
      return editOrReplyThenDelete(interaction, { content: '❌ Error occured.', ephemeral: true });
    }

    return interaction.reply({ content: '✅ Quote added successfully.', ephemeral: true });
  }

  @Slash({ name: 'get', description: 'Get quote' })
  @SlashGroup('quote')
  async getquote(
    @SlashOption({
      description: "Quote's keyword or ID",
      name: 'keyword',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    keyword: string,
    interaction: CommandInteraction,
  ): Promise<InteractionResponse<boolean> | void> {
    const guildId = interaction.guildId;
    let quotes: IUserQuote[] = await getQuote(keyword, guildId!);
    if (quotes.length === 0) return editOrReplyThenDelete(interaction, '❌ No quote found.');

    quotes = quotes.filter((quote) => interaction.user.id === quote.user || quote.private === false);
    if (quotes.length === 0) return editOrReplyThenDelete(interaction, '❌ Quote privated.');

    return interaction.reply({ content: randomArray(quotes).quote?.value, ephemeral: true });
  }

  @Slash({ name: 'list', description: 'List quotes' })
  @SlashGroup('quote')
  async listquotes(interaction: CommandInteraction): Promise<any> {
    const guildId = interaction.guildId;
    let quotes: IUserQuote[] = await getListQuotes(guildId!);

    if (quotes.length === 0) return editOrReplyThenDelete(interaction, '❌ No quote found.');

    let splitedQuotes = splitToChunks(quotes, CommonConstants.QUOTES_PER_PAGE);

    const pages = splitedQuotes.map((chunk: IUserQuote[], index: number) => {
      const embed = ListQuoteEmbed(
        interaction.user,
        interaction.client as Client,
        chunk,
        index + 1,
        splitedQuotes.length,
      );

      return { embeds: [embed] };
    });

    const pagination = commonPagination(interaction, pages, CommonConstants.PAGINATION_TYPE.BUTTON, false);
    return await pagination.send();
  }

  @Slash({ name: 'mine', description: 'My quotes' })
  @SlashGroup('quote')
  async myquotes(interaction: CommandInteraction): Promise<any> {
    const user = interaction.guild!.members.cache.get(interaction.user.id);

    let quotes: IUserQuote[] = await getUserQuotes(user!);

    if (quotes.length === 0) return editOrReplyThenDelete(interaction, '❌ No quote found.');

    let splitedQuotes = splitToChunks(quotes, CommonConstants.QUOTES_PER_PAGE);

    const pages = splitedQuotes.map((chunk: Array<IUserQuote>, index: number) => {
      const embed = ListQuoteEmbed(
        interaction.user,
        interaction.client as Client,
        chunk,
        index + 1,
        splitedQuotes.length,
      );

      return { embeds: [embed] };
    });

    const pagination = commonPagination(interaction, pages, CommonConstants.PAGINATION_TYPE.BUTTON, false);
    return await pagination.send();
  }

  @Slash({ name: 'edit', description: 'Edit quote' })
  @SlashGroup('quote')
  async editquote(
    @SlashOption({
      description: "Quote 's ID",
      name: 'id',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    id: string,
    @SlashOption({
      description: "Quote 's content",
      name: 'content',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    content: string,
    @SlashOption({
      description: "Quote's attachment (only 1 for slash)",
      name: 'attachment',
      required: false,
      type: ApplicationCommandOptionType.Attachment,
    })
    attachment: APIAttachment,
    interaction: CommandInteraction,
  ): Promise<any> {
    if (!content && !attachment) return editOrReplyThenDelete(interaction, '❌ Content required.');

    const user = interaction.guild?.members.cache.get(interaction.user.id);
    const response = await editQuote(user!, id, `${content} ${attachment ? attachment.url : ''}`.trim());

    return interaction.reply({ content: response, ephemeral: true });
  }

  @Slash({ name: 'publish', description: 'Publish your quote' })
  @SlashGroup('quote')
  async publishquote(
    @SlashOption({
      description: "Quote 's ID",
      name: 'id',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    id: string,
    interaction: CommandInteraction,
  ): Promise<any> {
    const user = interaction.guild?.members.cache.get(interaction.user.id);
    const response = await publishQuote(user!, id);

    return interaction.reply({ content: response, ephemeral: true });
  }

  @Slash({ name: 'private', description: 'Private your quote' })
  @SlashGroup('quote')
  async privatequote(
    @SlashOption({
      description: "Quote 's ID",
      name: 'id',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    id: string,
    interaction: CommandInteraction,
  ): Promise<any> {
    const user = interaction.guild?.members.cache.get(interaction.user.id);
    const response = await privateQuote(user!, id);

    return interaction.reply({ content: response, ephemeral: true });
  }

  @Slash({ name: 'delete', description: 'Delete quote' })
  @SlashGroup('quote')
  async deletequote(
    @SlashOption({
      description: "Quote's ID",
      name: 'id',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    id: string,
    interaction: CommandInteraction,
  ): Promise<any> {
    const user = interaction.guild?.members.cache.get(interaction.user.id);
    const response = await deleteQuote(user!, id);

    return interaction.reply({ content: response, ephemeral: true });
  }
}
