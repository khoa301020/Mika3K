import { NovelCommandDecorator } from './decorators';
import { Injectable } from '@nestjs/common';
import type { SlashCommandContext } from 'necord';
import { Context, Subcommand } from 'necord';
import { SyosetuEmbeds } from '../syosetu.embeds';

@Injectable()
@NovelCommandDecorator({ name: 'syosetu', description: 'Syosetu commands' })
export class SyosetuGenresCommands {
  constructor(private readonly syosetuEmbeds: SyosetuEmbeds) {}

  @Subcommand({ name: 'genres',
    description: 'View Syosetu genres',
  })
  public async viewGenres(@Context() [interaction]: SlashCommandContext) {
    await interaction.deferReply();
    return interaction.editReply({ embeds: [this.syosetuEmbeds.genres(interaction.user)] });
  }
}
