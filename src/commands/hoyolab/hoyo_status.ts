import { CommandInteraction } from 'discord.js';
import { Client, Discord, Slash, SlashGroup } from 'discordx';
import { HoYoLABInfoEmbed } from '../../providers/embeds/hoyolabEmbed.js';
import { hoyolabApi } from '../../services/hoyolab.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
@SlashGroup({ name: 'hoyolab', description: 'HoYoLAB commands' })
export class HoYoLABInfo {
  @SlashGroup('hoyolab')
  @Slash({ description: 'Get your HoYoLAB info', name: 'info' })
  async info(interaction: CommandInteraction): Promise<any> {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;
    const user = await hoyolabApi.getUserInfo(userId);
    if (!user) return editOrReplyThenDelete(interaction, '❌ Account data not found, please save the cookie first.');

    const embed = HoYoLABInfoEmbed(user, interaction.client as Client);
    return interaction.editReply({ embeds: [embed] });
  }
}
