import axios from 'axios';
import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage, Slash, SlashGroup, SlashOption } from 'discordx';
import { NHentaiConstants } from '../../constants/index.js';
import { NHentaiBookEmbed } from '../../providers/embeds/nhentaiEmbed.js';

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
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    axios
      .get(`${NHentaiConstants.NHENTAI_BASE_API}/book/${code}`)
      .then((res) => {
        const embed = NHentaiBookEmbed(res, interaction.user);

        interaction.editReply({ embeds: [embed] });
      })
      .catch((err) => {
        console.log(err);
        interaction.editReply({ content: err.message });
      });
  }

  @SimpleCommand({ aliases: ['nhentai', 'nh'], description: 'Check NHentai nuke code' })
  checkCodeCommand(command: SimpleCommandMessage): void {
    axios
      .get(`${NHentaiConstants.NHENTAI_BASE_API}/book/${command.message.content}`)
      .then((res) => {
        const embed = NHentaiBookEmbed(res, command.message.author);
        command.message.reply({ embeds: [embed] });
      })
      .catch((err) => {
        console.log(err);
        command.message.reply({ content: err.message });
      });
  }
}
