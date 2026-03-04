import { MalCommandDecorator } from './decorators';
import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import type { SlashCommandContext } from 'necord';
import { Context, Options, Subcommand } from 'necord';
import { PaginationService } from '../../../shared/pagination';
import { PeopleSearchDto } from '../dto';
import { MalEmbeds } from '../mal.embeds';
import { MalService } from '../mal.service';
import type { IPeople } from '../mal.types';

@Injectable()
@MalCommandDecorator({ name: 'people', description: 'People commands' })
export class PeopleCommands {
  constructor(
    private readonly malService: MalService,
    private readonly malEmbeds: MalEmbeds,
    private readonly paginationService: PaginationService,
  ) {}

  @Subcommand({ name: 'search', description: 'Search MAL people' })
  async peopleSearch(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: PeopleSearchDto,
  ) {
    await interaction.deferReply({
      flags: !dto.display ? [MessageFlags.Ephemeral] : [],
    });
    const params: Record<string, any> = {};
    if (dto.q) params.q = dto.q;
    if (dto.order_by) params.order_by = dto.order_by;
    if (dto.sort) params.sort = dto.sort;

    try {
      const res = await this.malService.peopleSearch(
        new URLSearchParams(params).toString(),
      );
      if (!res.data || res.data.length === 0)
        return interaction.editReply({ content: '❌ No people found.' });
      const pages = res.data.map((p: IPeople, i: number) => ({
        embeds: [
          this.malEmbeds.people(p, interaction.user, i + 1, res.data.length),
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
