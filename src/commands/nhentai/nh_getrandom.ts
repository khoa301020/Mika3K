import axios from 'axios';
import { CommandInteraction } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage, Slash, SlashGroup } from 'discordx';
import { NHentaiConstants } from '../../constants/index.js';
import { NHentaiBookEmbed } from '../../providers/embeds/nhentaiEmbed.js';

@SlashGroup({ description: 'nhentai-commands', name: 'nhentai' })
@Discord()
class GetNHentaiRandom {
  @SlashGroup('nhentai')
  @Slash({ description: 'Get random NHentai nuke code', name: 'random' })
  async getRandomSlash(interaction: CommandInteraction): Promise<void> {
    axios
      .get(`${NHentaiConstants.NHENTAI_API}/random`)
      .then((res) => {
        const embed = NHentaiBookEmbed(res, interaction.user);

        interaction.reply({ embeds: [embed], ephemeral: true });
      })
      .catch((err) => {
        console.log(err);
        interaction.reply({ content: err.message, ephemeral: true });
      });
  }

  @SimpleCommand({ aliases: ['nhrandom', 'nr'], description: 'Get random NHentai nuke code' })
  getRandomCommand(command: SimpleCommandMessage): void {
    axios
      .get(`${NHentaiConstants.NHENTAI_API}/random`)
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
