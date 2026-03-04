import { NovelCommandDecorator } from './decorators';
import { Injectable } from '@nestjs/common';
import type { SlashCommandContext } from 'necord';
import { Context, Options, Subcommand, StringOption } from 'necord';
import { PaginationService } from '../../../shared/pagination';
import { SyosetuEmbeds } from '../syosetu.embeds';
import { SyosetuService } from '../syosetu.service';

class SyosetuSearchDto {
  @StringOption({
    name: 'query',
    description: 'Novel title or keywords to search',
    required: true,
  })
  query: string;
}

@Injectable()
@NovelCommandDecorator({ name: 'syosetu', description: 'Syosetu commands' })
export class SyosetuSearchCommands {
  constructor(
    private readonly syosetuService: SyosetuService,
    private readonly syosetuEmbeds: SyosetuEmbeds,
    private readonly paginationService: PaginationService,
  ) {}

  @Subcommand({ name: 'search',
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
}
