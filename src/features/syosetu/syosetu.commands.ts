import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, Options } from 'necord';
import type { SlashCommandContext } from 'necord';
import { StringOption } from 'necord';
import { MessageFlags } from 'discord.js';
import { SyosetuService } from './syosetu.service';
import { SyosetuConstants } from './syosetu.constants';
import { SyosetuEmbeds } from './syosetu.embeds';
import { PaginationService } from '../../shared/pagination';

export class SyosetuSearchDto {
  @StringOption({
    name: 'query',
    description: 'Novel title or keywords to search',
    required: true,
  })
  query: string;
}

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
  constructor(
    private readonly syosetuService: SyosetuService,
    private readonly syosetuEmbeds: SyosetuEmbeds,
    private readonly paginationService: PaginationService,
  ) {}

  @SlashCommand({
    name: 'syosetu-search',
    description: 'Search Syosetu novels',
  })
  public async searchNovel(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: SyosetuSearchDto,
  ) {
    await interaction.deferReply();
    try {
      const data = await this.syosetuService.getNovel({
        word: dto.query,
        out: 'json',
        of: ['t', 'n', 'u', 'w', 's', 'bg', 'g', 'k', 'gf', 'gl', 'ga', 'l', 'ti', 'nt', 'e', 'nu'],
        lim: 20,
      });
      if (!data || data[0].allcount === 0 || data.length < 2) {
        return interaction.editReply({ content: '❌ No novels found.' });
      }
      
      const novels = data.slice(1);
      if (novels.length === 1) {
        return interaction.editReply({ embeds: [this.syosetuEmbeds.novel(novels[0] as any, interaction.user)] });
      }
      
      const pages = novels.map((n: any, idx: number) => ({
        embeds: [this.syosetuEmbeds.novel(n, interaction.user, idx + 1, novels.length)],
      }));
      
      return this.paginationService.paginate(interaction, pages);
    } catch (err: any) {
      return interaction.editReply({ content: `❌ Error: ${err.message}` });
    }
  }

  @SlashCommand({
    name: 'syosetu-genres',
    description: 'View Syosetu genres',
  })
  public async viewGenres(@Context() [interaction]: SlashCommandContext) {
    await interaction.deferReply();
    return interaction.editReply({ embeds: [this.syosetuEmbeds.genres(interaction.user)] });
  }

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
