import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import type {
    SlashCommandContext,
    TextCommandContext,
    UserCommandContext,
} from 'necord';
import {
    Arguments,
    Context,
    Options,
    SlashCommand,
    TextCommand,
    UserCommand,
} from 'necord';
import { CheckInfoDto } from '../dto';
import { MiscEmbeds } from '../misc.embeds';

@Injectable()
export class CheckInfoCommands {
  constructor(private readonly miscEmbeds: MiscEmbeds) {}

  @SlashCommand({ name: 'check-info', description: 'Check user info' })
  async checkInfo(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: CheckInfoDto,
  ) {
    const targetUser = dto.user ?? interaction.user;
    const member = await interaction
      .guild!.members.fetch(targetUser.id)
      .catch(() => null);
    if (!member)
      return interaction.reply({
        content: '❌ Invalid user',
        flags: [MessageFlags.Ephemeral],
      });

    return interaction.reply({
      embeds: [this.miscEmbeds.userInfo(interaction.user, member)],
      flags: [MessageFlags.Ephemeral],
    });
  }

  @UserCommand({ name: 'Check user info' })
  async checkInfoContext(@Context() [interaction]: UserCommandContext) {
    const member = interaction.guild!.members.cache.get(interaction.targetId);
    if (!member)
      return interaction.reply({
        content: '❌ User not found',
        flags: [MessageFlags.Ephemeral],
      });

    return interaction.reply({
      embeds: [this.miscEmbeds.userInfo(interaction.user, member)],
      flags: [MessageFlags.Ephemeral],
    });
  }

  @TextCommand({
    name: 'checkinfo',
    description: 'Check user info',
    // aliases: ['info', 'userinfo'],
  })
  async onCheckInfoText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const mentionMatch = args[0]?.match(/^<@!?(\d+)>$/);
    const userId = mentionMatch ? mentionMatch[1] : message.author.id;

    const member = await message
      .guild!.members.fetch(userId)
      .catch(() => null);
    if (!member) return message.reply('❌ Invalid user');

    return message.reply({
      embeds: [this.miscEmbeds.userInfo(message.author, member)],
    });
  }
}
