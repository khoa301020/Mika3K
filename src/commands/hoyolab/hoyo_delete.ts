import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx';
import { hoyolabApi } from '../../services/hoyolab.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
@SlashGroup({ name: 'hoyolab', description: 'HoYoLAB commands' })
export class HoYoLABDelete {
  @SlashGroup('hoyolab')
  @Slash({ description: 'Delete HoYoLAB user remark', name: 'delete' })
  async delete(
    @SlashOption({
      description: 'Remarks of the account (use `/hoyolab info` to see info containing remarks)',
      name: 'remark',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    remark: string,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;
    await hoyolabApi.deleteAccount(userId, remark).catch((err) => {
      return editOrReplyThenDelete(interaction, { content: err });
    });
    return await editOrReplyThenDelete(interaction, { content: `✅ User remark **${remark}** has been deleted.` });
  }
}
