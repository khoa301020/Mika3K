import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, MetadataStorage, Slash, SlashChoice, SlashOption } from 'discordx';

@Discord()
export class SlashExample {
  // example: pagination for all slash command
  @Slash({
    description: 'Get command(s) info',
    name: 'help',
  })
  async pages(
    @SlashChoice(...MetadataStorage.instance.applicationCommands.map((cmd) => cmd.name))
    @SlashOption({
      description: 'Select command',
      name: 'command',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    command: string,
    interaction: CommandInteraction,
  ): Promise<void> {
    interaction.reply('Done');
  }
}
