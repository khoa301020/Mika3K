import { Injectable, Logger } from '@nestjs/common';
import { Context, Options, SlashCommand, MessageCommand } from 'necord';
import type { SlashCommandContext, MessageCommandContext } from 'necord';
import { StringOption } from 'necord';
import { ChannelType, MessageFlags } from 'discord.js';
import { NotifyChannelService, NotifyType } from '../../shared/notify-channel';
import { NHentaiService } from './nhentai.service';
import { NHentaiEmbed } from './nhentai.events';
import { PaginationService } from '../../shared/pagination';

export class NHentaiAutoviewDto {
  @StringOption({
    name: 'action',
    description: 'Enable or disable autoview',
    required: true,
    choices: [
      { name: 'Enable', value: 'on' },
      { name: 'Disable', value: 'off' },
    ],
  })
  action: 'on' | 'off';
}

@Injectable()
export class NHentaiCommands {
  private readonly logger = new Logger(NHentaiCommands.name);

  constructor(
    private readonly notifyChannelService: NotifyChannelService,
    private readonly nhentaiService: NHentaiService,
    private readonly paginationService: PaginationService,
  ) {}

  @SlashCommand({
    name: 'nh-autoview',
    description: 'Toggle nHentai autoview for this channel',
  })
  public async toggleAutoview(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: NHentaiAutoviewDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    // Owner-only check
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.editReply({
        content: '❌ Only the bot owner can use this command.',
      });
    }

    // Must be in a guild text channel
    if (interaction.channel?.type !== ChannelType.GuildText) {
      return interaction.editReply({
        content: '❌ This command is only available in guild text channels.',
      });
    }

    // Must be NSFW
    if (!interaction.channel.nsfw) {
      return interaction.editReply({
        content: '❌ This command is only available in NSFW channels.',
      });
    }

    if (dto.action === 'on') {
      await this.notifyChannelService.enableChannel(
        interaction.guildId!,
        interaction.channelId,
        NotifyType.NHENTAI_AUTOVIEW,
      );
      return interaction.editReply({
        content: '✅ nHentai autoview **enabled** for this channel.',
      });
    } else {
      await this.notifyChannelService.disableChannel(
        interaction.channelId,
        NotifyType.NHENTAI_AUTOVIEW,
      );
      return interaction.editReply({
        content: '✅ nHentai autoview **disabled** for this channel.',
      });
    }
  }

  @MessageCommand({ name: 'Search NHentai' })
  public async searchNHentaiContext(
    @Context() [interaction]: MessageCommandContext,
  ) {
    // Must be NSFW
    if (
      !interaction.channel?.isTextBased() ||
      !('nsfw' in interaction.channel) ||
      !interaction.channel.nsfw
    ) {
      return interaction.reply({
        content: '❌ This command is only available in NSFW channels.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    await interaction.deferReply();
    const message = interaction.targetMessage;

    // Process query to match V1 logic
    const query =
      `${message.content} ${message.embeds.length > 0 ? message.embeds.map((e) => e.title || '').join(' ') : ''}`
        .replace(/<a?:.+?:\d+>/g, '') // remove all emojis
        .replace(/<@!?\d+>/g, '') // remove all mentions
        .replace(/https?:\/\/\S+/g, '') // remove all links (both http and https)
        .trim();

    if (!query) {
      return interaction.editReply({ content: '❌ Text required to search.' });
    }

    try {
      const codes: Array<string> | null = query.match(/(?<!\d)\d{6}(?!\d)/g);

      if (codes && codes.length > 0) {
        // Attempt exact code resolution
        const results = [];
        for (const code of codes) {
          const data = await this.nhentaiService.getGallery(code);
          if (!data) continue;
          results.push(data);
          // Mimic V1 3333 param limit rate protection if multiple codes
          if (codes.length > 1) {
            await new Promise((r) => setTimeout(r, 3333));
          }
        }

        if (results.length === 0)
          return interaction.editReply({ content: '❌ No code found' });

        if (results.length === 1) {
          const embed = NHentaiEmbed(results[0], interaction.user);
          return await interaction.editReply({ embeds: [embed] });
        } else {
          const pages = results.map((book, index) => {
            const embed = NHentaiEmbed(
              book,
              interaction.user,
              index + 1,
              results.length,
            );
            return { embeds: [embed] };
          });
          return await this.paginationService.paginate(interaction, pages, {
            type: 'button',
            ephemeral: false,
          });
        }
      } else {
        // Fallback string search
        const data = await this.nhentaiService.searchGallery(query);
        if (!data || data.result.length === 0)
          return interaction.editReply({ content: '❌ No result found' });

        const list = data.result;

        const pages = list.map((book, index) => {
          // Recreate book mock
          const bookData = {
            ...book,
            total_search_page: data.num_pages,
            current_search_page: 1,
          };
          const embed = NHentaiEmbed(
            bookData,
            interaction.user,
            index + 1,
            list.length,
          );
          return { embeds: [embed] };
        });

        return await this.paginationService.paginate(interaction, pages, {
          type: 'button',
          ephemeral: false,
        });
      }
    } catch (err: any) {
      return interaction.editReply({
        content: err.message || '❌ Error occurred.',
      });
    }
  }
}
