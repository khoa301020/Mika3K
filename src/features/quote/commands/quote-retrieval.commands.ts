import { Injectable } from '@nestjs/common';
import type { ButtonInteraction } from 'discord.js';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageActionRowComponentBuilder,
    MessageFlags,
} from 'discord.js';
import type { SlashCommandContext, TextCommandContext } from 'necord';
import {
    Arguments,
    Button,
    Context,
    Options,
    SlashCommand,
    TextCommand,
} from 'necord';
import { PaginationService } from '../../../shared/pagination';
import { splitToChunks } from '../../../shared/utils';
import { GetQuoteDto, ListQuotesDto } from '../dto';
import { QuoteEmbeds } from '../quote.embeds';
import type { QuoteSort } from '../quote.service';
import { QuoteService } from '../quote.service';

const QUOTES_PER_PAGE = 10;

const refreshQuoteBtn = () =>
  new ButtonBuilder()
    .setLabel('🔄')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('refreshQuote');

const quoteRow = () =>
  new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    refreshQuoteBtn(),
  );

@Injectable()
export class QuoteRetrievalCommands {
  constructor(
    private readonly quoteService: QuoteService,
    private readonly quoteEmbeds: QuoteEmbeds,
    private readonly paginationService: PaginationService,
  ) {}

  // --- Get Quote ---

  @SlashCommand({
    name: 'quote-get',
    description: 'Get a quote by keyword or ID',
  })
  async getQuote(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: GetQuoteDto,
  ) {
    const quote = await this.quoteService.getRandomQuote(
      dto.keyword,
      interaction.guildId!,
      interaction.user.id,
    );

    if (!quote)
      return interaction.reply({
        content: '❌ No quote found.',
        flags: [MessageFlags.Ephemeral],
      });
    if (quote.private && quote.user !== interaction.user.id) {
      return interaction.reply({
        content: '❌ The quote is privated.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    return interaction.reply({
      content: quote.quote?.value,
      embeds: quote.quote?.embeds,
      allowedMentions: { repliedUser: false },
    });
  }

  @TextCommand({
    name: '$$',
    description: 'Get a quote',
    // aliases: ['getquote'],
  })
  async onGetText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const keyword = args[0]?.trim();
    if (!keyword) return message.reply('❌ Keyword required.');

    const quote = await this.quoteService.getRandomQuote(
      keyword,
      message.guildId!,
      message.author.id,
    );
    if (!quote) return message.reply('❌ No quote found.');

    if (quote.private === true && quote.user !== message.author.id) {
      return message.reply('❌ This quote is private.');
    }

    const reply = await message.reply({
      content: quote.quote?.value,
      embeds: quote.quote?.embeds,
      allowedMentions: { repliedUser: false },
      components: quote.isOnly ? [] : [quoteRow()],
    });

    setTimeout(() => {
      reply.edit({ components: [] }).catch(() => {});
    }, 60 * 1000);
  }

  // --- List Quotes ---

  @SlashCommand({ name: 'quote-list', description: 'List server quotes' })
  async listQuotes(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: ListQuotesDto,
  ) {
    const sort = (dto.sort as QuoteSort) || 'key';
    const order = (dto.order as 1 | -1) || 1;
    const quotes = await this.quoteService.listQuotes(
      interaction.guildId!,
      sort,
      order,
    );

    if (!quotes || quotes.length === 0) {
      return interaction.reply({
        content: '❌ No quote found.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const chunks = splitToChunks(quotes, QUOTES_PER_PAGE);
    const pages = chunks.map((chunk, index) => ({
      embeds: [
        this.quoteEmbeds.listQuotes(
          interaction.user,
          chunk,
          index + 1,
          chunks.length,
        ),
      ],
    }));

    return this.paginationService.paginate(interaction, pages, {
      ephemeral: false,
    });
  }

  @TextCommand({
    name: 'listquotes',
    description: 'List server quotes',
    // aliases: ['lq'],
  })
  async onListQuotesText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    let sort: QuoteSort = (args[0] as QuoteSort) || 'key';
    const order: 'asc' | 'desc' = (args[1] as 'asc' | 'desc') || 'asc';

    if (!['key', 'hits'].includes(sort)) sort = 'key';

    const quotes = await this.quoteService.listQuotes(
      message.guildId!,
      sort,
      order === 'asc' ? 1 : -1,
    );

    if (!quotes || quotes.length === 0) {
      return message.reply('❌ No quote found.');
    }

    const chunks = splitToChunks(quotes, QUOTES_PER_PAGE);
    const embeds = chunks.map((chunk: any[], index: number) =>
      this.quoteEmbeds.listQuotes(
        message.author,
        chunk,
        index + 1,
        chunks.length,
      ),
    );

    return message.reply({ embeds: [embeds[0]] });
  }

  // --- My Quotes ---

  @SlashCommand({ name: 'quote-mine', description: 'List your quotes' })
  async myQuotes(@Context() [interaction]: SlashCommandContext) {
    const quotes = await this.quoteService.getUserQuotes(
      interaction.user.id,
      interaction.guildId!,
    );

    if (quotes.length === 0) {
      return interaction.reply({
        content: '❌ No quote found.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const chunks = splitToChunks(quotes, QUOTES_PER_PAGE);
    const pages = chunks.map((chunk, index) => ({
      embeds: [
        this.quoteEmbeds.listQuotes(
          interaction.user,
          chunk,
          index + 1,
          chunks.length,
        ),
      ],
    }));

    return this.paginationService.paginate(interaction, pages, {
      ephemeral: false,
    });
  }

  @TextCommand({
    name: 'myquotes',
    description: 'List your quotes',
    // aliases: ['mq'],
  })
  async onMyQuotesText(@Context() [message]: TextCommandContext) {
    const quotes = await this.quoteService.getUserQuotes(
      message.author.id,
      message.guildId!,
    );

    if (quotes.length === 0) return message.reply('❌ No quote found.');

    const chunks = splitToChunks(quotes, QUOTES_PER_PAGE);
    const embeds = chunks.map((chunk: any[], index: number) =>
      this.quoteEmbeds.listQuotes(
        message.author,
        chunk,
        index + 1,
        chunks.length,
      ),
    );

    return message.reply({ embeds: [embeds[0]] });
  }

  // --- Refresh Button ---

  @Button('refreshQuote')
  async onRefreshQuote(@Context() [interaction]: [ButtonInteraction]) {
    const commandMessage = interaction.message.channel?.messages.cache.get(
      interaction.message.reference?.messageId ?? '',
    );

    if (!commandMessage || interaction.user.id !== commandMessage.author.id) {
      return interaction.reply({
        content: '❌ Only message author can retry.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    await interaction.deferUpdate();

    const keyword = commandMessage.content.split(' ')[1];
    const quote = await this.quoteService.getRandomQuote(
      keyword,
      commandMessage.guildId!,
      commandMessage.author.id,
    );

    if (!quote) return;

    const refreshBtn = new ButtonBuilder()
      .setLabel('🔄')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('refreshQuote');
    const row =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        refreshBtn,
      );

    await interaction.message.edit({
      content: quote.quote?.value,
      embeds: quote.quote?.embeds,
      components: [row],
      allowedMentions: { repliedUser: false },
    });
  }
}
