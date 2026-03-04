import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import type {
    MessageCommandContext,
    SlashCommandContext,
    TextCommandContext,
} from 'necord';
import {
    Arguments,
    Context,
    MessageCommand,
    Options,
    SlashCommand,
    TextCommand,
} from 'necord';
import { PaginationService } from '../../../shared/pagination';
import { SaucenaoDto } from '../dto';
import { MiscEmbeds } from '../misc.embeds';
import { MiscService } from '../misc.service';

@Injectable()
export class SaucenaoCommands {
  constructor(
    private readonly miscService: MiscService,
    private readonly miscEmbeds: MiscEmbeds,
    private readonly paginationService: PaginationService,
  ) {}

  private async handleSaucenaoResult(
    interaction: any,
    imageUrl: string,
    isEphemeral: boolean,
  ) {
    const data = await this.miscService.searchSaucenao(imageUrl);

    if (data.header?.status !== 0) {
      return interaction.editReply({
        content: `❌ ${data.header?.message ?? 'Search failed'}`,
      });
    }

    const results = this.miscService.filterSaucenaoResults(data);
    if (!results) {
      return interaction.editReply({
        content: '❌ No results found or similarity too low.',
      });
    }

    if (results.length === 1) {
      return interaction.editReply({
        embeds: [this.miscEmbeds.saucenaoResult(interaction.user, results[0])],
      });
    }

    const pages = results.map((result: any, i: number) => ({
      embeds: [
        this.miscEmbeds.saucenaoResult(
          interaction.user,
          result,
          i + 1,
          results.length,
        ),
      ],
    }));

    return this.paginationService.paginate(interaction, pages, {
      ephemeral: isEphemeral,
    });
  }

  @SlashCommand({ name: 'saucenao', description: 'SauceNAO image search' })
  async saucenao(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: SaucenaoDto,
  ) {
    if (!dto.url && !dto.attachment) {
      return interaction.reply({
        content: '❌ URL or attachment required.',
        flags: [MessageFlags.Ephemeral],
      });
    }
    if (dto.url && dto.attachment) {
      return interaction.reply({
        content: '❌ Only one of URL or attachment.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    await interaction.deferReply({
      flags: !dto.isPublic ? [MessageFlags.Ephemeral] : [],
    });

    const imageUrl = dto.url ?? dto.attachment?.url;
    return this.handleSaucenaoResult(interaction, imageUrl, !dto.isPublic);
  }

  @MessageCommand({ name: 'Search SauceNAO' })
  async saucenaoContext(@Context() [interaction]: MessageCommandContext) {
    await interaction.deferReply();

    const message = interaction.targetMessage;
    let imageUrl = message.content;
    const attachments = message.attachments.map((a: any) => a.url);
    if (attachments.length > 0) imageUrl = attachments[0];

    if (!imageUrl) {
      return interaction.editReply({
        content: '❌ No image found in message.',
      });
    }

    return this.handleSaucenaoResult(interaction, imageUrl, false);
  }

  @TextCommand({
    name: 'saucenao',
    description: 'SauceNAO image search',
    // aliases: ['sn'],
  })
  async onSaucenaoText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const url = args[0];
    const attachments = message.attachments.map((a) => a.url);

    if (!url && attachments.length === 0) {
      return message.reply('❌ URL or attachment required.');
    }
    if (url && attachments.length > 0) {
      return message.reply('❌ Only one of URL or attachment.');
    }
    if (attachments.length > 1) {
      return message.reply('❌ Too many attachments.');
    }

    const imageUrl = url ?? attachments[0];

    try {
      const data = await this.miscService.searchSaucenao(imageUrl);

      if (data.header?.status !== 0) {
        return message.reply(
          `❌ ${data.header?.message ?? 'Search failed'}`,
        );
      }

      const results = this.miscService.filterSaucenaoResults(data);
      if (!results) {
        return message.reply('❌ No results found or similarity too low.');
      }

      if (results.length === 1) {
        return message.reply({
          embeds: [
            this.miscEmbeds.saucenaoResult(message.author, results[0]),
          ],
        });
      }

      // For text commands, reply with all result embeds (max 10 per message)
      const embeds = results.slice(0, 10).map((result, i) =>
        this.miscEmbeds.saucenaoResult(
          message.author,
          result,
          i + 1,
          results.length,
        ),
      );

      return message.reply({ embeds });
    } catch {
      return message.reply('❌ Search failed.');
    }
  }
}
