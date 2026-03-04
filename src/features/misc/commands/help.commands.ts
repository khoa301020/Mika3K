import { Injectable } from '@nestjs/common';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import type { SlashCommandContext } from 'necord';
import { Context, SlashCommand } from 'necord';

@Injectable()
export class HelpCommands {
  @SlashCommand({ name: 'help', description: 'List all available commands' })
  public async help(@Context() [interaction]: SlashCommandContext) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const commands = interaction.client.application?.commands.cache;
    if (!commands || commands.size === 0) {
      await interaction.client.application?.commands.fetch();
    }

    const allCommands = interaction.client.application?.commands.cache;
    if (!allCommands || allCommands.size === 0) {
      return interaction.editReply({ content: 'No commands found.' });
    }

    const commandList = allCommands
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((cmd) => `\`/${cmd.name}\` — ${cmd.description}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('📖 Available Commands')
      .setDescription(commandList.slice(0, 4096))
      .setTimestamp()
      .setFooter({
        text: `${interaction.client.user?.displayName || 'Mika3K'} • ${allCommands.size} commands`,
        iconURL: interaction.client.user?.displayAvatarURL(),
      });

    return interaction.editReply({ embeds: [embed] });
  }
}
