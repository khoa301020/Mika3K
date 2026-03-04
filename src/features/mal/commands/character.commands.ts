import { MalCommandDecorator } from './decorators';
import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import type { SlashCommandContext } from 'necord';
import { Context, Options, Subcommand } from 'necord';
import { PaginationService } from '../../../shared/pagination';
import { CharacterSearchDto } from '../dto';
import { MalEmbeds } from '../mal.embeds';
import { MalService } from '../mal.service';
import type { ICharacter } from '../mal.types';

@Injectable()
@MalCommandDecorator({ name: 'character', description: 'Character commands' })
export class CharacterCommands {
  constructor(
    private readonly malService: MalService,
    private readonly malEmbeds: MalEmbeds,
    private readonly paginationService: PaginationService,
  ) {}

  @Subcommand({ name: 'search',
    description: 'Search MAL character',
  })
  async characterSearch(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: CharacterSearchDto,
  ) {
    await interaction.deferReply({
      flags: !dto.display ? [MessageFlags.Ephemeral] : [],
    });
    const params: Record<string, any> = {};
    if (dto.q) params.q = dto.q;
    if (dto.order_by) params.order_by = dto.order_by;
    if (dto.sort) params.sort = dto.sort;

    try {
      const res = await this.malService.characterSearch(
        new URLSearchParams(params).toString(),
      );
      if (!res.data || res.data.length === 0)
        return interaction.editReply({ content: '❌ No character found.' });
      const pages = res.data.map((ch: ICharacter, i: number) => ({
        embeds: [
          this.malEmbeds.character(
            ch,
            interaction.user,
            i + 1,
            res.data.length,
          ),
        ],
      }));
      return this.paginationService.paginate(interaction, pages, {
        ephemeral: !dto.display,
      });
    } catch (err: any) {
      return interaction.editReply({ content: `❌ ${err.message}` });
    }
  }
}
