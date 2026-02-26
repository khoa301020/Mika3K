import { Injectable, Logger } from '@nestjs/common';
import { Context, Options, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { StringOption } from 'necord';
import { ChannelType, MessageFlags } from 'discord.js';
import { NotifyChannelService, NotifyType } from '../../shared/notify-channel';

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

  constructor(private readonly notifyChannelService: NotifyChannelService) {}

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
}
