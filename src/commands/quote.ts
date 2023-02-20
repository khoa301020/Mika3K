import {
  APIAttachment,
  ApplicationCommandOptionType,
  CommandInteraction,
  InteractionResponse,
  Message,
} from 'discord.js';
import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
  SlashGroup,
  SlashOption,
} from 'discordx';
import { randomArray } from '../helpers/helper.js';
import { createQuote, getQuote } from '../services/quote.js';
import { IUserQuote } from '../types/quote.js';

@Discord()
@SlashGroup({ description: 'Quote commands', name: 'quote' })
// @SlashGroup({ description: 'List all quote command', name: 'list', root: 'quote' })
// @SlashGroup({ description: 'Create command', name: 'create', root: 'quote' })
// @SlashGroup({ description: 'Get command', name: 'get', root: 'quote' })
class Quote {
  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////     Message Command   /////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  @SimpleCommand({ aliases: ['$', 'addquote'], description: 'Create new quote', argSplitter: ' ' })
  async createQuoteCommand(
    @SimpleCommandOption({ name: 'command', type: SimpleCommandOptionType.String })
    cmd: string,
    @SimpleCommandOption({ name: 'key', type: SimpleCommandOptionType.String })
    key: string,
    command: SimpleCommandMessage,
  ): Promise<Message<boolean>> {
    if (!key) return command.message.reply('Keyword required.');

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
        if (!quoteResponse) return command.message.reply('Error occured.');
      });
    } catch (error) {
      return command.message.reply('Error occured.');
    }

    return command.message.reply('Quote added successfully.');
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

    if (quotes.length === 0) return command.message.reply('No quote found.');

    return command.message.reply({ content: randomArray(quotes).quote?.value });
  }

  ////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////     Slash Command   //////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  @Slash({ description: 'Create quote' })
  @SlashGroup('quote')
  async create(
    @SlashOption({
      description: 'Keyword of the quote',
      name: 'keyword',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    keyword: string,
    @SlashOption({
      description: 'Content of the quote',
      name: 'content',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    content: string,
    @SlashOption({
      description: 'Attachment of the quote',
      name: 'attachment',
      required: false,
      type: ApplicationCommandOptionType.Attachment,
    })
    attachment: APIAttachment,
    interaction: CommandInteraction,
  ): Promise<InteractionResponse<boolean>> {
    if (!content && !attachment) return interaction.reply('Content required.');

    const quote: IUserQuote = {
      guild: interaction.guildId!,
      user: interaction.user.id,
      quote: {
        key: keyword,
        value: `${content} ${attachment.url}`.trim(),
      },
      createdAt: new Date(),
    };

    try {
      createQuote(quote).then((quoteResponse) => {
        if (!quoteResponse) return interaction.reply({ content: 'Error occured.', ephemeral: true });
      });
    } catch (error) {
      return interaction.reply({ content: 'Error occured.', ephemeral: true });
    }

    return interaction.reply({ content: 'Quote added successfully.', ephemeral: true });
  }

  @Slash({ description: 'Get quote' })
  @SlashGroup('quote')
  async get(
    @SlashOption({
      description: 'Keyword of the quote',
      name: 'keyword',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    keyword: string,
    interaction: CommandInteraction,
  ): Promise<InteractionResponse<boolean>> {
    const guildId = interaction.guildId;
    let quotes: IUserQuote[] = await getQuote(keyword, guildId!);

    if (quotes.length === 0) return interaction.reply('No quote found.');

    return interaction.reply({ content: randomArray(quotes).quote?.value, ephemeral: true });
  }
}
