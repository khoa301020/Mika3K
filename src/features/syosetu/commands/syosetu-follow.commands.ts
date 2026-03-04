import { NovelCommandDecorator } from './decorators';
import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import type { SlashCommandContext } from 'necord';
import { Context, Options, Subcommand, StringOption } from 'necord';
import { SyosetuConstants } from '../syosetu.constants';
import { SyosetuService } from '../syosetu.service';

class SyosetuFollowDto {
  @StringOption({
    name: 'ncode',
    description: 'Novel N-code (e.g. n9669bk)',
    required: true,
  })
  ncode: string;
}

@Injectable()
@NovelCommandDecorator({ name: 'syosetu', description: 'Syosetu commands' })
export class SyosetuFollowCommands {
  constructor(private readonly syosetuService: SyosetuService) {}

  @Subcommand({ name: 'follow',
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

  @Subcommand({ name: 'unfollow',
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

  @Subcommand({ name: 'follow-channel',
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

  @Subcommand({ name: 'unfollow-channel',
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
