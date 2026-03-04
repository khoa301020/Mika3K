import { Injectable } from '@nestjs/common';
import type { ModalSubmitInteraction } from 'discord.js';
import {
    ActionRowBuilder,
    APIEmbed,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import type { MessageCommandContext, SlashCommandContext, TextCommandContext } from 'necord';
import {
    Arguments,
    Context,
    MessageCommand,
    Modal,
    Options,
    SlashCommand,
    TextCommand,
} from 'necord';
import { AppCacheService } from '../../../shared/cache';
import { CreateQuoteDto, EditQuoteDto, QuoteIdDto } from '../dto';
import { QuoteService } from '../quote.service';

@Injectable()
export class QuoteManagementCommands {
  constructor(
    private readonly quoteService: QuoteService,
    private readonly cacheService: AppCacheService,
  ) {}

  // --- Create ---

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

  @TextCommand({
    name: '$',
    description: 'Create a quote',
    // aliases: ['createquote'],
  })
  async onCreateText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const key = args[0];
    if (!key) return message.reply('❌ Keyword required.');

    const value = args.slice(1).join(' ').trim();
    const attachments = message.attachments.map((a) => a.url).join(', ');

    if (!value && !attachments) return message.reply('❌ Content required.');

    try {
      await this.quoteService.create({
        guild: message.guildId!,
        user: message.author.id,
        quote: {
          key,
          value: `${value ?? ''} ${attachments ?? ''}`.trim(),
        },
      });
      return message.reply('✅ Quote added successfully.');
    } catch {
      return message.reply('❌ Error occurred.');
    }
  }

  // --- Edit ---

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

  @TextCommand({
    name: 'editquote',
    description: 'Edit a quote',
    // aliases: ['eq'],
  })
  async onEditQuoteText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const id = args[0];
    if (!id) return message.reply('❌ ID required.');

    const content = args.slice(1).join(' ').trim();
    const attachments = message.attachments.map((a) => a.url).join(', ');

    if (!content && !attachments) return message.reply('❌ Content required.');

    const response = await this.quoteService.edit(
      message.author.id,
      message.guildId!,
      id,
      `${content ?? ''} ${attachments ?? ''}`.trim(),
    );
    return message.reply(response);
  }

  // --- Delete ---

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

  @TextCommand({
    name: 'deletequote',
    description: 'Delete a quote',
    // aliases: ['dq'],
  })
  async onDeleteQuoteText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const id = args[0];
    if (!id) return message.reply('❌ ID required.');

    const response = await this.quoteService.delete(
      message.author.id,
      message.guildId!,
      id,
    );
    return message.reply(response);
  }

  // --- Publish ---

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

  @TextCommand({
    name: 'publishquote',
    description: 'Publish a quote',
    // aliases: ['plq'],
  })
  async onPublishQuoteText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const id = args[0];
    if (!id) return message.reply('❌ ID required.');

    const response = await this.quoteService.publish(
      message.author.id,
      message.guildId!,
      id,
    );
    return message.reply(response);
  }

  // --- Private ---

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

  @TextCommand({
    name: 'privatequote',
    description: 'Make a quote private',
    // aliases: ['prq'],
  })
  async onPrivateQuoteText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const id = args[0];
    if (!id) return message.reply('❌ ID required.');

    const response = await this.quoteService.setPrivate(
      message.author.id,
      message.guildId!,
      id,
    );
    return message.reply(response);
  }

  // --- Context Menu: Save Quote ---

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
}
