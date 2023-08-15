import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { SyosetuConstants } from '../../constants/index.js';
import { SyosetuGenreListEmbed } from '../../providers/embeds/syosetuEmbed.js';
import { I18n } from '../../types/common.js';

@Discord()
@SlashGroup({ name: 'syosetu', description: 'Syosetu commands' })
class Syosetu {
  @SlashGroup('syosetu')
  @Slash({ name: 'genres', description: 'List novel genres' })
  async syosetuGenreList(
    @SlashChoice({ name: '日本語', value: 'jp' }, { name: 'English', value: 'en' })
    @SlashOption({
      description: 'Language',
      name: 'language',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    language: keyof I18n,
    interaction: CommandInteraction,
  ): Promise<any> {
    const listBigGenres: string = Object.entries(SyosetuConstants.BIG_GENRES)
      .map(([key, value]) => `${key}: ${value[language]}`)
      .join('\n');

    const listGenres: string = Object.entries(SyosetuConstants.GENRES)
      .map(([key, value]) => `${key}: ${value[language]}`)
      .join('\n');

    const embed = SyosetuGenreListEmbed(listBigGenres, listGenres, language);
    return await interaction.reply({ embeds: [embed] });
  }
}
