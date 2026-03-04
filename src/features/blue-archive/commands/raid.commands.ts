import { BuruakaCommandDecorator } from './decorators';
import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import type { SlashCommandContext } from 'necord';
import { Context, Options, Subcommand } from 'necord';
import * as C from '../ba.constants';
import { BaEmbeds } from '../ba.embeds';
import { BaService } from '../ba.service';
import { RaidSearchDto } from '../dto';

@Injectable()
@BuruakaCommandDecorator()
export class RaidCommands {
  constructor(
    private readonly baService: BaService,
    private readonly baEmbeds: BaEmbeds,
  ) {}

  @Subcommand({ name: 'raid', description: 'Search Blue Archive raid' })
  async raidSearch(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: RaidSearchDto,
  ) {
    await interaction.deferReply({
      flags: !dto.display ? [MessageFlags.Ephemeral] : [],
    });
    try {
      const raid = await this.baService.getRaidById(dto.raidId);
      if (!raid)
        return interaction.editReply({ content: '❌ Raid not found.' });
      if (C.RAID_DIFFICULTIES[dto.difficulty] > raid.MaxDifficulty[0])
        return interaction.editReply({
          content: `❌ Unavailable difficulty **${dto.difficulty}** for **${raid.Name}**.`,
        });
      return interaction.editReply({
        embeds: [
          await this.baEmbeds.raid(raid, dto.difficulty, interaction.user),
        ],
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }
}
