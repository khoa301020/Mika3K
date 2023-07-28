import { ApplicationCommandOptionType, CommandInteraction, InteractionResponse, Message } from 'discord.js';
import { Client, Discord, SimpleCommand, SimpleCommandMessage, Slash, SlashOption } from 'discordx';
import { MathEmbed } from '../../providers/embeds/commonEmbed.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
class MathCalculation {
  @SimpleCommand({ aliases: ['m', 'math'], description: 'Math calculate' })
  mathCommand(command: SimpleCommandMessage): Promise<Message<boolean> | void> {
    const content = command.message.content.split(' ').slice(1).join(' ').trim();

    const result = eval(content);

    if (!result) return editOrReplyThenDelete(command.message, { content: '❌ Invalid expression' });

    const embed = MathEmbed(content, result.toString(), command.message.client as Client);
    return command.message.reply({ embeds: [embed] });
  }

  @Slash({ description: 'Math calculate', name: 'math' })
  math(
    @SlashOption({
      description: 'Math expression',
      name: 'expression',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    expression: string,
    interaction: CommandInteraction,
  ): Promise<InteractionResponse<boolean> | void> {
    const result = eval(expression);

    if (!result) return editOrReplyThenDelete(interaction, { content: '❌ Invalid expression', ephemeral: true });

    const embed = MathEmbed(expression, result.toString(), interaction.client as Client);

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
