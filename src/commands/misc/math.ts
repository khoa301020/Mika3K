import axios from 'axios';
import { ApplicationCommandOptionType, CommandInteraction, InteractionResponse, Message } from 'discord.js';
import { Client, Discord, SimpleCommand, SimpleCommandMessage, Slash, SlashOption } from 'discordx';
import CommonConstants from '../../constants/common.js';
import { MathEmbed } from '../../providers/embeds/commonEmbed.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
class MathCalculation {
  @SimpleCommand({ aliases: ['m', 'math'], description: 'Math calculate' })
  async mathCommand(command: SimpleCommandMessage): Promise<Promise<Message<boolean> | void> | undefined> {
    const content = command.argString.trim();
    if (!content) return;

    const result: number = await axios
      .get(`${CommonConstants.MATHJS_API}${encodeURIComponent(content)}`)
      .then((res) => parseFloat(res.data));

    if (!result) return editOrReplyThenDelete(command.message, { content: '❌ Invalid expression' });

    const embed = MathEmbed(content, result.toString(), command.message.client as Client);
    return command.message.reply({ embeds: [embed] });
  }

  @Slash({ description: 'Math calculate', name: 'math' })
  async math(
    @SlashOption({
      description: 'Math expression',
      name: 'expression',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    expression: string,
    interaction: CommandInteraction,
  ): Promise<InteractionResponse<boolean> | void> {
    try {
      const result: number = await axios
        .get(`${CommonConstants.MATHJS_API}${encodeURIComponent(expression)}`)
        .then((res) => parseFloat(res.data));

      if (!result) return editOrReplyThenDelete(interaction, { content: '❌ Invalid expression', ephemeral: true });

      const embed = MathEmbed(expression, result.toString(), interaction.client as Client);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      return editOrReplyThenDelete(interaction, { content: '❌ Invalid expression', ephemeral: true });
    }
  }
}
