import { Injectable } from '@nestjs/common';
import {
  Context,
  Options,
  SlashCommand,
  MessageCommand,
  Button,
  Modal,
} from 'necord';
import type { SlashCommandContext, MessageCommandContext } from 'necord';
import {
  ActionRowBuilder,
  APIEmbed,
  ButtonBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
} from 'discord.js';
import type { ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import { QuoteService } from './quote.service';
import type { QuoteSort } from './quote.service';
import { QuoteEmbeds } from './quote.embeds';
import {
  CreateQuoteDto,
  GetQuoteDto,
  ListQuotesDto,
  QuoteIdDto,
  EditQuoteDto,
} from './dto';
import { PaginationService } from '../../shared/pagination';
import { AppCacheService } from '../../shared/cache';
import { splitToChunks } from '../../shared/utils';

const QUOTES_PER_PAGE = 10;

@Injectable()
export class QuoteCommands {
  constructor(
    private readonly quoteService: QuoteService,
    private readonly quoteEmbeds: QuoteEmbeds,
    private readonly paginationService: PaginationService,
    private readonly cacheService: AppCacheService,
  ) {}

  // --- Slash Commands ---

  @SlashCommand({ name: 'quote-create', description: 'Create a new quote' })
  async createQuote(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: CreateQuoteDto,
  ) {
    if (!dto.content && !dto.attachment) {
      return interaction.reply({
        content: '❌ Content required.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const value =
      `${dto.content ?? ''} ${dto.attachment ? dto.attachment.url : ''}`.trim();

    try {
      await this.quoteService.create({
        guild: interaction.guildId!,
        user: interaction.user.id,
        quote: { key: dto.keyword, value },
        private: dto.isPrivate,
      });
      return interaction.reply({
        content: '✅ Quote added successfully.',
        flags: [MessageFlags.Ephemeral],
      });
    } catch {
      return interaction.reply({
        content: '❌ Error occurred.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

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

  @SlashCommand({ name: 'quote-edit', description: 'Edit a quote' })
  async editQuote(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: EditQuoteDto,
  ) {
    if (!dto.content && !dto.attachment) {
      return interaction.reply({
        content: '❌ Content required.',
        flags: [MessageFlags.Ephemeral],
      });
    }
    const content =
      `${dto.content ?? ''} ${dto.attachment ? dto.attachment.url : ''}`.trim();
    const response = await this.quoteService.edit(
      interaction.user.id,
      interaction.guildId!,
      dto.id,
      content,
    );
    return interaction.reply({
      content: response,
      flags: [MessageFlags.Ephemeral],
    });
  }

  @SlashCommand({ name: 'quote-publish', description: 'Publish your quote' })
  async publishQuote(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: QuoteIdDto,
  ) {
    const response = await this.quoteService.publish(
      interaction.user.id,
      interaction.guildId!,
      dto.id,
    );
    return interaction.reply({
      content: response,
      flags: [MessageFlags.Ephemeral],
    });
  }

  @SlashCommand({
    name: 'quote-private',
    description: 'Make your quote private',
  })
  async privateQuote(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: QuoteIdDto,
  ) {
    const response = await this.quoteService.setPrivate(
      interaction.user.id,
      interaction.guildId!,
      dto.id,
    );
    return interaction.reply({
      content: response,
      flags: [MessageFlags.Ephemeral],
    });
  }

  @SlashCommand({ name: 'quote-delete', description: 'Delete a quote' })
  async deleteQuote(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: QuoteIdDto,
  ) {
    const response = await this.quoteService.delete(
      interaction.user.id,
      interaction.guildId!,
      dto.id,
    );
    return interaction.reply({
      content: response,
      flags: [MessageFlags.Ephemeral],
    });
  }

  // --- Context Menu ---

  @MessageCommand({ name: 'Quote this message' })
  async saveQuoteContextMenu(@Context() [interaction]: MessageCommandContext) {
    const message = interaction.targetMessage;
    const embeds: APIEmbed[] = message.embeds.map((embed) => embed.toJSON());

    const modal = new ModalBuilder()
      .setTitle(
        `Save quote${embeds.length > 0 ? ' (embeds cannot be edited)' : ''}`,
      )
      .setCustomId('saveQuoteForm');

    const remarkInput = new TextInputBuilder()
      .setCustomId('remarkField')
      .setLabel('Remark (no space and special characters)')
      .setRequired(true)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter quote remark');

    const contentInput = new TextInputBuilder()
      .setCustomId('contentField')
      .setLabel(
        `Content${embeds.length > 0 ? ' (optional because embeds exist)' : ''}`,
      )
      .setRequired(embeds.length === 0)
      .setStyle(TextInputStyle.Paragraph)
      .setValue(
        `${message.content} ${message.attachments.map((a) => a.url).join(', ')}`.trim(),
      );

    await this.cacheService.set(
      `quote-${interaction.user.id}-embeds`,
      embeds,
      10 * 60,
    );

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(remarkInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput),
    );

    await interaction.showModal(modal);
  }

  @Modal('saveQuoteForm')
  async onSaveQuoteModal(@Context() [interaction]: [ModalSubmitInteraction]) {
    const remark = interaction.fields.getTextInputValue('remarkField');
    const content = interaction.fields.getTextInputValue('contentField');
    const embeds = await this.cacheService.get<APIEmbed[]>(
      `quote-${interaction.user.id}-embeds`,
    );

    if (!embeds && !content) {
      return interaction.reply({
        content: '❌ Content required.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (remark.match(/[^a-zA-Z0-9]/g)) {
      return interaction.reply({
        content: '❌ Keyword cannot have special characters.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    try {
      await this.quoteService.create({
        guild: interaction.guildId!,
        user: interaction.user.id,
        quote: { key: remark, value: content, embeds: embeds || undefined },
      });
      return interaction.reply({
        content: '✅ Quote added successfully.',
        flags: [MessageFlags.Ephemeral],
      });
    } catch {
      return interaction.reply({
        content: '❌ Error occurred.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

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
