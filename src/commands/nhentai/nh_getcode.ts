import axios from 'axios';
import { ApplicationCommandOptionType, CommandInteraction, Message } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage, Slash, SlashGroup, SlashOption } from 'discordx';
import { NHentaiConstants } from '../../constants/index.js';
import { editOrReplyThenDelete } from '../../helpers/helper.js';
import { NHentaiEmbed } from '../../providers/embeds/nhentaiEmbed.js';

@SlashGroup({ description: 'NHentai commands', name: 'nhentai' })
@Discord()
class GetNHentaiCode {
  @SlashGroup('nhentai')
  @Slash({ description: 'Check NHentai nuke code', name: 'check' })
  async checkCode(
    @SlashOption({
      description: 'NHentai code',
      name: 'code',
      required: true,
      type: ApplicationCommandOptionType.Integer,
    })
    code: String,
    interaction: CommandInteraction,
  ): Promise<void | Message<boolean>> {
    await interaction.deferReply({ ephemeral: true });
    return axios
      .get(`${NHentaiConstants.NHENTAI_BASE_API}/book/${code}`)
      .then((res) => {
        const embed = NHentaiEmbed(res.data.data, interaction.user);
        return interaction.editReply({ embeds: [embed] });
      })
      .catch((err) => {
        console.log(err);
        return editOrReplyThenDelete(interaction, { content: err.message });
      });
  }

  @SimpleCommand({ aliases: ['nhentai', 'nh'], description: 'Check NHentai nuke code' })
  async checkCodeCommand(command: SimpleCommandMessage): Promise<Message<boolean> | void> {
    try {
      const res = await axios.get(`${NHentaiConstants.NHENTAI_BASE_API}/book/${command.message.content}`);
      const embed = NHentaiEmbed(res.data.data, command.message.author);
      return await command.message.reply({ embeds: [embed] });
    } catch (err: any) {
      console.log(err);
      return await editOrReplyThenDelete(command.message, { content: err.message });
    }
  }
}
