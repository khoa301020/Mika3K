import { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashGroup } from 'discordx';
import { fetchData } from '../../services/bluearchive.js';

@Discord()
@SlashGroup({ name: 'buruaka', description: 'Blue Archive commands' })
@SlashGroup({ name: 'sync', description: 'Blue Archive sync commands', root: 'buruaka' })
export class BlueArchiveSync {
  @SlashGroup('sync', 'buruaka')
  @Slash({ name: 'all', description: 'Sync all' })
  async syncAll(interaction: CommandInteraction): Promise<any> {
    console.log(interaction.client.application.owner);

    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply('Only the bot owner can sync.');
    await interaction.deferReply({ ephemeral: true });
    Object.entries(fetchData).map(([key, value]) => value());
    return interaction.editReply('Done');
  }
}
