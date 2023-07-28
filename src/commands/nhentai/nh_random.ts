import { CommandInteraction, Message, TextChannel } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage, Slash, SlashGroup } from 'discordx';
import { NHentaiConstants } from '../../constants/index.js';
import { NHentaiEmbed } from '../../providers/embeds/nhentaiEmbed.js';
import { simulateNHentaiRequest } from '../../services/nhentai.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@SlashGroup({ description: 'NHentai commands', name: 'nhentai' })
@Discord()
class RandomNHentaiCode {
  @SlashGroup('nhentai')
  @Slash({ description: 'Random NHentai', name: 'random' })
  async randomNHentaiSlash(interaction: CommandInteraction): Promise<void | Message<boolean>> {
    await interaction.deferReply({ ephemeral: !(interaction.channel as TextChannel)?.nsfw ?? true });
    // const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_RANDOM_ENDPOINT);
    const res = await simulateNHentaiRequest(
      NHentaiConstants.NHENTAI_GALLERY_ENDPOINT(
        Math.floor(Math.random() * parseInt(process.env.NHENTAI_MAX_ID ?? '400000')) + 1,
      ),
    );
    if (!res.data) return await interaction.editReply({ content: 'No result found' });
    const embed = NHentaiEmbed(res.data, interaction.user);
    return await interaction.editReply({ embeds: [embed] });
  }

  @SimpleCommand({ aliases: ['nhrd', 'nhrandom'], description: 'Random NHentai' })
  async randomNHentaiCommand(command: SimpleCommandMessage): Promise<Message<boolean> | void> {
    try {
      if (!(command.message.channel as TextChannel).nsfw)
        return await editOrReplyThenDelete(command.message, {
          content: 'This command can only be used in NSFW channel',
        });
      // const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_RANDOM_ENDPOINT);
      const res = await simulateNHentaiRequest(
        NHentaiConstants.NHENTAI_GALLERY_ENDPOINT(
          Math.floor(Math.random() * parseInt(process.env.NHENTAI_MAX_ID ?? '400000')) + 1,
        ),
      );
      if (!res.data) return await editOrReplyThenDelete(command.message, { content: 'No result found' });
      const embed = NHentaiEmbed(res.data, command.message.author);
      return await command.message.reply({ embeds: [embed] });
    } catch (err: any) {
      console.log(err);
      return await editOrReplyThenDelete(command.message, { content: err.message });
    }
  }
}
