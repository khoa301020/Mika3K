import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, Options } from 'necord';
import type { SlashCommandContext } from 'necord';
import { StringOption } from 'necord';
import { MessageFlags } from 'discord.js';
import { SyosetuService } from './syosetu.service';
import { SyosetuConstants } from './syosetu.constants';

export class SyosetuFollowDto {
  @StringOption({
    name: 'ncode',
    description: 'Novel N-code (e.g. n9669bk)',
    required: true,
  })
  ncode: string;
}

@Injectable()
export class SyosetuCommands {
  constructor(private readonly syosetuService: SyosetuService) {}

  @SlashCommand({
    name: 'syosetu-follow',
    description: 'Follow a Syosetu novel for update notifications',
  })
  public async followNovel(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: SyosetuFollowDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const ncode = dto.ncode.toLowerCase();
    const [exists, isSaved] = await this.syosetuService.checkNovelExists(ncode);

    if (!exists) {
      return interaction.editReply({
        content: `❌ Novel with ncode \`${ncode}\` not found.`,
      });
    }

    if (!isSaved) {
      await this.syosetuService.saveNovelInfo([ncode]);
    }

    await this.syosetuService.followNovel(interaction.user.id, ncode, 'users');

    return interaction.editReply({
      content: `✅ Now following **${ncode}**! You'll receive DMs when new chapters are published.\n${SyosetuConstants.NCODE_NOVEL_BASE_URL}${ncode}`,
    });
  }

  @SlashCommand({
    name: 'syosetu-unfollow',
    description: 'Unfollow a Syosetu novel',
  })
  public async unfollowNovel(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: SyosetuFollowDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const ncode = dto.ncode.toLowerCase();

    await this.syosetuService.unfollowNovel(
      interaction.user.id,
      ncode,
      'users',
    );

    return interaction.editReply({
      content: `✅ Unfollowed **${ncode}**.`,
    });
  }

  @SlashCommand({
    name: 'syosetu-follow-channel',
    description: 'Follow a Syosetu novel for this channel',
  })
  public async followNovelChannel(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: SyosetuFollowDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const ncode = dto.ncode.toLowerCase();
    const [exists, isSaved] = await this.syosetuService.checkNovelExists(ncode);

    if (!exists) {
      return interaction.editReply({
        content: `❌ Novel with ncode \`${ncode}\` not found.`,
      });
    }

    if (!isSaved) {
      await this.syosetuService.saveNovelInfo([ncode]);
    }

    await this.syosetuService.followNovel(
      interaction.channelId,
      ncode,
      'channels',
    );

    return interaction.editReply({
      content: `✅ This channel is now following **${ncode}**!`,
    });
  }

  @SlashCommand({
    name: 'syosetu-unfollow-channel',
    description: 'Unfollow a Syosetu novel for this channel',
  })
  public async unfollowNovelChannel(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: SyosetuFollowDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const ncode = dto.ncode.toLowerCase();

    await this.syosetuService.unfollowNovel(
      interaction.channelId,
      ncode,
      'channels',
    );

    return interaction.editReply({
      content: `✅ This channel has unfollowed **${ncode}**.`,
    });
  }
}
