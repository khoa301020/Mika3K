import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx';
import { KakuyomuNovelEmbed } from '../../providers/embeds/kakuyomuEmbed.js';
import { KakuyomuAPI } from '../../services/kakuyomu.js';
import { IKakuyomuNovel } from '../../types/kakuyomu.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
@SlashGroup({ name: 'novel', description: 'Novel commands' })
class Kakuyomu {
  @SlashGroup('kakuyomu', 'novel')
  @Slash({ name: 'info', description: 'Get Kakuyomu novel info' })
  async searchKakuyomu(
    @SlashOption({
      description: 'The ID of the novel',
      name: 'novel-id',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    novelId: string,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply();

    const novel: IKakuyomuNovel | null = await KakuyomuAPI.getNovelInfo(novelId);

    if (!novel) return editOrReplyThenDelete(interaction, '❌ Novel not found');

    const embed = KakuyomuNovelEmbed(novel);

    return await interaction.editReply({ embeds: [embed] });
  }
}
