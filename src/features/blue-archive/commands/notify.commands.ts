import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MessageFlags } from 'discord.js';
import { Model } from 'mongoose';
import type { SlashCommandContext, TextCommandContext } from 'necord';
import {
    Arguments,
    Context,
    Options,
    SlashCommand,
    TextCommand,
} from 'necord';
import * as C from '../ba.constants';
import { NotifyChannel, type NotifyChannelDocument } from '../ba.schemas';
import { BaNotifyDto } from '../dto';

@Injectable()
export class NotifyCommands {
  constructor(
    @InjectModel(NotifyChannel.name)
    private readonly notifyModel: Model<NotifyChannelDocument>,
  ) {}

  @SlashCommand({
    name: 'ba-notify',
    description: 'Toggle SchaleDB update notifications for this channel',
  })
  public async toggleNotify(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: BaNotifyDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.editReply({
        content: '❌ Only the bot owner can use this command.',
      });
    }

    if (dto.action === 'on') {
      await this.notifyModel.findOneAndUpdate(
        { channelId: interaction.channelId, notifyType: C.BA_SCHALEDB_UPDATE },
        { guildId: interaction.guildId!, channelId: interaction.channelId, notifyType: C.BA_SCHALEDB_UPDATE },
        { upsert: true },
      );
      return interaction.editReply({
        content: '✅ SchaleDB update notifications **enabled** for this channel.',
      });
    } else {
      await this.notifyModel.findOneAndDelete({
        channelId: interaction.channelId,
        notifyType: C.BA_SCHALEDB_UPDATE,
      });
      return interaction.editReply({
        content: '✅ SchaleDB update notifications **disabled** for this channel.',
      });
    }
  }

  @TextCommand({
    name: 'banotify',
    description: 'Toggle Blue Archive update notifications for this channel',
    // aliases: ['bant'],
  })
  async onBaNotifyText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    if (message.author.id !== process.env.OWNER_ID) {
      return message.reply('❌ Only the bot owner can use this command');
    }

    const action = args[0] as 'add' | 'remove';
    if (!action || !['add', 'remove'].includes(action)) {
      return message.reply('❌ Usage: `banotify <add|remove>`');
    }

    if (action === 'add') {
      await this.notifyModel.findOneAndUpdate(
        { channelId: message.channelId },
        {
          guildId: message.guildId,
          channelId: message.channelId,
          notifyType: 'BA_SCHALEDB_UPDATE',
        },
        { upsert: true },
      );
      return message.reply('✅ Notify channel added');
    } else {
      await this.notifyModel.deleteOne({
        channelId: message.channelId,
        notifyType: 'BA_SCHALEDB_UPDATE',
      });
      return message.reply('✅ Notify channel removed');
    }
  }
}
