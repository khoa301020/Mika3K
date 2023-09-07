import {
  APIAttachment,
  APIEmbed,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  InteractionResponse,
  Message,
  MessageActionRowComponentBuilder,
  MessageContextMenuCommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import {
  ButtonComponent,
  ContextMenu,
  Discord,
  ModalComponent,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
  SlashChoice,
  SlashGroup,
  SlashOption,
} from 'discordx';
import { SortValues } from 'mongoose';
import { CommonConstants } from '../../constants/index.js';
import { botPrefix, cache } from '../../main.js';
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
import { IUserQuote, QuoteSort } from '../../types/quote.js';
import { editOrReplyThenDelete, splitToChunks, timeout } from '../../utils/index.js';

const refreshQuoteBtn = () =>
  new ButtonBuilder().setLabel('🔄').setStyle(ButtonStyle.Primary).setCustomId('refreshQuote');

const quoteRow = () => new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(refreshQuoteBtn());

@Discord()
@SlashGroup({ description: 'Quote commands', name: 'quote' })
class QuoteCommand {
  @SimpleCommand({ aliases: [botPrefix, 'createquote'], description: 'Create new quote', argSplitter: ' ' })
  async createQuoteCommand(
    @SimpleCommandOption({ name: 'command', type: SimpleCommandOptionType.String })
    cmd: string,
    @SimpleCommandOption({ name: 'key', type: SimpleCommandOptionType.String })
    key: string,
    command: SimpleCommandMessage,
  ): Promise<Message<boolean> | void> {
    if (!key) return editOrReplyThenDelete(command.message, '❌ Keyword required.');

    const value = command.message.content.split(' ').slice(2).join(' ').trim();
    const attachments = command.message.attachments.map((a) => a.url).join(', ');

    if (!value && !attachments) return editOrReplyThenDelete(command.message, '❌ Content required.');

    const quote: IUserQuote = {
      guild: command.message.guildId!,
      user: command.message.author.id,
      quote: {
        key: key,
        value: `${value ?? ''} ${attachments ?? ''}`.trim(),
      },
      createdAt: new Date(),
    };

    try {
      createQuote(quote).then((quoteResponse) => {
        if (!quoteResponse) return editOrReplyThenDelete(command.message, '❌ Error occured.');
      });
    } catch (error) {
      return editOrReplyThenDelete(command.message, '❌ Error occured.');
    }

    return editOrReplyThenDelete(command.message, '✅ Quote added successfully.');
  }

  @SimpleCommand({ aliases: [botPrefix.repeat(2), 'getquote'], description: 'Get quote', argSplitter: ' ' })
  async getQuoteCommand(
    @SimpleCommandOption({ name: 'command', type: SimpleCommandOptionType.String })
    cmd: string,
    @SimpleCommandOption({ name: 'key', type: SimpleCommandOptionType.String })
    key: string,
    command: SimpleCommandMessage,
  ): Promise<Message<boolean> | void> {
    if (!key) return editOrReplyThenDelete(command.message, '❌ Keyword required.');
    const keyword = key.trim();
    const guildId = command.message.guildId;
    let quote = await getQuote(keyword, guildId!, command.message.author.id);
    if (!quote) return editOrReplyThenDelete(command.message, '❌ No quote found.');

    if (quote.private === true && quote.user !== command.message.author.id)
      return editOrReplyThenDelete(command.message, '❌ The quote is privated.');

    return command.message
      .reply({
        content: quote.quote?.value,
        embeds: quote.quote?.embeds,
        allowedMentions: { repliedUser: false },
        components: quote.isOnly ? [] : [quoteRow()],
      })
      .then(async (message) => {
        await timeout(60 * 1000);
        message.edit({
          components: [],
        });
      });
  }

  @SimpleCommand({ aliases: ['lq', 'listquotes'], description: 'Get list quote', argSplitter: ' ' })
  async getListQuotesCommand(
    @SimpleCommandOption({ name: 'sort', type: SimpleCommandOptionType.String })
    sort: QuoteSort = 'key',
    @SimpleCommandOption({ name: 'order', type: SimpleCommandOptionType.String })
    order: 'asc' | 'desc' = 'asc',
    command: SimpleCommandMessage,
  ): Promise<any> {
    const guildId = command.message.guildId;
    if (sort && !CommonConstants.QUOTE_LIST_SORT_BY[sort]) sort = 'key';
    if (order && !['asc', 'desc'].includes(order.toString())) order = 'asc';

    let quotes = await getListQuotes(guildId!, sort, order === 'asc' ? 1 : -1);

    if (!quotes || quotes.length === 0) return editOrReplyThenDelete(command.message, '❌ No quote found.');

    let splitedQuotes = splitToChunks(quotes, CommonConstants.QUOTES_PER_PAGE);

    const pages = splitedQuotes.map((chunk: IUserQuote[], index: number) => {
      const embed = ListQuoteEmbed(command.message.author, chunk, index + 1, splitedQuotes.length);
      return { embeds: [embed] };
    });

    const pagination = commonPagination(command, pages, CommonConstants.PAGINATION_TYPE.BUTTON, false);
    return await pagination.send();
  }

  @SimpleCommand({ aliases: ['mq', 'myquotes'], description: 'Get list quote', argSplitter: ' ' })
  async getMyQuotesCommand(command: SimpleCommandMessage): Promise<any> {
    const user = command.message.guild!.members.cache.get(command.message.author.id);
    let quotes: IUserQuote[] = await getUserQuotes(user!);

    if (quotes.length === 0) return editOrReplyThenDelete(command.message, '❌ No quote found.');

    let splitedQuotes = splitToChunks(quotes, CommonConstants.QUOTES_PER_PAGE);

    const pages = splitedQuotes.map((chunk: IUserQuote[], index: number) => {
      const embed = ListQuoteEmbed(command.message.author, chunk, index + 1, splitedQuotes.length);

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
    if (!id) return editOrReplyThenDelete(command.message, '❌ ID required.');

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
    if (!id) return editOrReplyThenDelete(command.message, '❌ ID required.');

    const content = command.message.content.split(' ').slice(2).join(' ').trim();
    const attachments = command.message.attachments.map((a) => a.url).join(', ');

    if (!content && !attachments) return editOrReplyThenDelete(command.message, '❌ Content required.');

    const user = command.message.guild!.members.cache.get(command.message.author.id);

    const response = await editQuote(user!, id, `${content ?? ''} ${attachments ?? ''}`.trim());

    return command.message.reply(response);
  }

  @SimpleCommand({ aliases: ['dq', 'deletequote'], description: 'Edit quote', argSplitter: ' ' })
  async deleteQuoteCommand(
    @SimpleCommandOption({ name: 'id', type: SimpleCommandOptionType.String })
    id: string,
    command: SimpleCommandMessage,
  ): Promise<any> {
    if (!id) return editOrReplyThenDelete(command.message, '❌ ID required.');

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
        value: `${content ?? ''} ${attachment ? attachment.url : ''}`.trim(),
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
    let quote = await getQuote(keyword, guildId!, interaction.user.id);
    if (!quote) return editOrReplyThenDelete(interaction, '❌ No quote found.');

    if (quote.private === true && quote.user !== interaction.user.id)
      return editOrReplyThenDelete(interaction, '❌ The quote(s) is privated.');

    return interaction.reply({
      content: quote.quote?.value,
      embeds: quote.quote?.embeds,
      allowedMentions: { repliedUser: false },
    });
  }

  @Slash({ name: 'list', description: 'List quotes' })
  @SlashGroup('quote')
  async listquotes(
    @SlashChoice({ name: 'Keyword', value: 'key' }, { name: 'Hits', value: 'hits' })
    @SlashOption({
      description: 'Sort by, default: key',
      name: 'sort',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    sort: QuoteSort = 'key',
    @SlashChoice({ name: 'Ascending', value: 1 }, { name: 'Descending', value: -1 })
    @SlashOption({
      description: 'Order by, default: asc',
      name: 'order',
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    order: Extract<SortValues, 1 | -1> = 1,
    interaction: CommandInteraction,
  ): Promise<any> {
    const guildId = interaction.guildId;
    let quotes = await getListQuotes(guildId!, sort, order);

    if (!quotes || quotes.length === 0) return editOrReplyThenDelete(interaction, '❌ No quote found.');

    let splitedQuotes = splitToChunks(quotes, CommonConstants.QUOTES_PER_PAGE);

    const pages = splitedQuotes.map((chunk: IUserQuote[], index: number) => {
      const embed = ListQuoteEmbed(interaction.user, chunk, index + 1, splitedQuotes.length);

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
      const embed = ListQuoteEmbed(interaction.user, chunk, index + 1, splitedQuotes.length);

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
    const response = await editQuote(user!, id, `${content ?? ''} ${attachment ? attachment.url : ''}`.trim());

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

@Discord()
class QuoteContextMenu {
  @ContextMenu({
    name: 'Quote this message',
    type: ApplicationCommandType.Message,
  })
  async saveQuoteContextMenu(interaction: MessageContextMenuCommandInteraction): Promise<void> {
    const message: Message = await (interaction.channel as TextChannel).messages.fetch(interaction.targetId);
    const embeds: APIEmbed[] = message.embeds.map((embed) => embed.toJSON());

    /* Modal init */
    const modal = new ModalBuilder()
      .setTitle(`Save quote${embeds.length > 0 ? ' (embeds cannot be edited)' : ''}`)
      .setCustomId('saveQuoteForm');

    const remarkInputComponent = new TextInputBuilder()
      .setCustomId('remarkField')
      .setLabel('Remark (no space and special characters)')
      .setRequired(true)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter quote remark');

    const contentInputComponent = new TextInputBuilder()
      .setCustomId('contentField')
      .setLabel(`Content${embeds.length > 0 ? ' (optional because embeds exist)' : ''}`)
      .setRequired(embeds.length === 0)
      .setStyle(TextInputStyle.Paragraph)
      .setValue(`${message.content} ${message.attachments.map((a) => a.url).join(', ')}`.trim());

    cache.set(`quote-${interaction.user.id}-embeds`, embeds, 10 * 60);

    const remarkRow = new ActionRowBuilder<TextInputBuilder>().addComponents(remarkInputComponent);

    const contentRow = new ActionRowBuilder<TextInputBuilder>().addComponents(contentInputComponent);

    modal.addComponents(remarkRow, contentRow);

    // Present the modal to the user
    interaction.showModal(modal);
  }

  @ModalComponent()
  async saveQuoteForm(interaction: ModalSubmitInteraction): Promise<void> {
    const [remark, content] = ['remarkField', 'contentField'].map((id) => interaction.fields.getTextInputValue(id));

    const embeds = cache.take(`quote-${interaction.user.id}-embeds`) as APIEmbed[];

    if (!embeds && !content) return editOrReplyThenDelete(interaction, '❌ Content required.');

    if (remark.match(/[^a-zA-Z0-9]/g))
      return editOrReplyThenDelete(interaction, '❌ Keyword cannot have special characters.');

    const quote: IUserQuote = {
      guild: interaction.guildId!,
      user: interaction.user.id,
      quote: {
        key: remark,
        value: content,
        embeds,
      },
      createdAt: new Date(),
    };

    try {
      createQuote(quote).then((quoteResponse) => {
        if (!quoteResponse) return editOrReplyThenDelete(interaction, '❌ Error occured.');
      });
    } catch (error) {
      return editOrReplyThenDelete(interaction, '❌ Error occured.');
    }

    return editOrReplyThenDelete(interaction, '✅ Quote added successfully.');
  }

  @ButtonComponent({ id: 'refreshQuote' })
  async profileBtnComponent(interaction: ButtonInteraction): Promise<Message<boolean> | void> {
    const commandMessage = interaction.message.channel?.messages.cache.get(interaction.message.reference?.messageId!);
    if (interaction.user.id !== commandMessage?.author.id)
      return editOrReplyThenDelete(interaction, {
        content: '❌ Only message author can retry.',
        ephemeral: true,
      });

    await interaction.deferUpdate();

    const quote = await getQuote(
      commandMessage.content.split(' ')[1],
      commandMessage.guildId!,
      commandMessage.author.id,
    );

    await interaction.message.edit({
      content: quote!.quote?.value,
      embeds: quote!.quote?.embeds,
      components: [quoteRow()],
      allowedMentions: { repliedUser: false },
    });
  }
}
