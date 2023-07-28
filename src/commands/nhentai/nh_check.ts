import { ApplicationCommandOptionType, CommandInteraction, Message, TextChannel } from 'discord.js';
import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
  SlashGroup,
  SlashOption,
} from 'discordx';
import { NHentaiConstants } from '../../constants/index.js';
import { NHentaiEmbed } from '../../providers/embeds/nhentaiEmbed.js';
import { simulateNHentaiRequest } from '../../services/nhentai.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@SlashGroup({ description: 'NHentai commands', name: 'nhentai' })
@Discord()
class CheckNHentaiCode {
  @SlashGroup('nhentai')
  @Slash({ description: 'Check NHentai nuke code', name: 'check' })
  async checkCodeSlash(
    @SlashOption({
      description: 'NHentai code',
      name: 'code',
      required: true,
      type: ApplicationCommandOptionType.Integer,
    })
    code: string,
    interaction: CommandInteraction,
  ): Promise<void | Message<boolean>> {
    await interaction.deferReply({ ephemeral: !(interaction.channel as TextChannel)?.nsfw ?? true });
    const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_GALLERY_ENDPOINT(code));
    if (!res.data) return await interaction.editReply({ content: 'Code not found' });
    const embed = NHentaiEmbed(res.data, interaction.user);
    return await interaction.editReply({ embeds: [embed] });
  }

  @SimpleCommand({ aliases: ['nhentai', 'nh'], description: 'Check NHentai nuke code' })
  async checkCodeCommand(
    @SimpleCommandOption({
      name: 'code',
      type: SimpleCommandOptionType.Number,
    })
    code: number,
    command: SimpleCommandMessage,
  ): Promise<Message<boolean> | void> {
    try {
      if (!code) return await editOrReplyThenDelete(command.message, { content: 'Please provide a code' });
      if (!(command.message.channel as TextChannel).nsfw)
        return await editOrReplyThenDelete(command.message, {
          content: 'This command can only be used in NSFW channel',
        });
      const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_GALLERY_ENDPOINT(code));
      if (!res.data) return await editOrReplyThenDelete(command.message, { content: 'Code not found' });
      const embed = NHentaiEmbed(res.data, command.message.author);
      return await command.message.reply({ embeds: [embed] });
    } catch (err: any) {
      console.log(err);
      return await editOrReplyThenDelete(command.message, { content: err.message });
    }
  }
}
