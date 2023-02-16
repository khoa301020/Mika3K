import axios from 'axios';
import { CommandInteraction } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage, Slash } from 'discordx';
import { Constants } from '../constants/constants.js';
import { NHentaiBookEmbed } from '../providers/nhentaiEmbed.js';

@Discord()
class GetNHentaiRandom {
  @Slash({ description: 'Get random NHentai nuke code', name: 'random-nuke' })
  async getRandomSlash(interaction: CommandInteraction): Promise<void> {
    axios
      .get(`${Constants.NHENTAI_API}/random`)
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
      .get(`${Constants.NHENTAI_API}/random`)
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
