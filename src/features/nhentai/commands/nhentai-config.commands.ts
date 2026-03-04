import { NHentaiCommandDecorator } from './decorators';
import { Injectable } from '@nestjs/common';
import { ChannelType, MessageFlags, TextChannel } from 'discord.js';
import type { SlashCommandContext, TextCommandContext } from 'necord';
import {
    Arguments,
    Context,
    Options,
    Subcommand,
    StringOption,
    TextCommand,
} from 'necord';
import { NotifyChannelService, NotifyType } from '../../../shared/notify-channel';

class NHentaiAutoviewDto {
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
@NHentaiCommandDecorator()
export class NHentaiConfigCommands {
  constructor(
    private readonly notifyChannelService: NotifyChannelService,
  ) {}

  @Subcommand({ name: 'nh-autoview',
    description: 'Toggle nHentai autoview for this channel',
  })
  public async toggleAutoview(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: NHentaiAutoviewDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.editReply({
        content: '❌ Only the bot owner can use this command.',
      });
    }

    if (interaction.channel?.type !== ChannelType.GuildText) {
      return interaction.editReply({
        content: '❌ This command is only available in guild text channels.',
      });
    }

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

  @TextCommand({
    name: 'nhautoview',
    description: 'Toggle nHentai autoview for this channel',
    // aliases: ['nha'],
  })
  async onNhAutoviewText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    if (message.author.id !== process.env.OWNER_ID) {
      return message.reply('❌ Only the bot owner can use this command');
    }

    if (message.channel.type !== ChannelType.GuildText) {
      return message.reply('❌ This command is only available in guild text channels.');
    }

    if (!(message.channel as TextChannel).nsfw) {
      return message.reply('❌ This command is only available in NSFW channels.');
    }

    const action = args[0] as 'on' | 'off';
    if (!action || !['on', 'off'].includes(action)) {
      return message.reply('❌ Usage: `nhautoview <on|off>`');
    }

    if (action === 'on') {
      await this.notifyChannelService.enableChannel(
        message.guildId!,
        message.channelId,
        NotifyType.NHENTAI_AUTOVIEW,
      );
      return message.reply('✅ NHentai Autoview **ON**');
    } else {
      await this.notifyChannelService.disableChannel(
        message.channelId,
        NotifyType.NHENTAI_AUTOVIEW,
      );
      return message.reply('✅ NHentai Autoview **OFF**');
    }
  }
}
