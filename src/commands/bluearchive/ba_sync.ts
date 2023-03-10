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
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply('Only the bot owner can sync.');
    await interaction.deferReply({ ephemeral: true });
    let promises: Array<Promise<any>> = Object.entries(fetchData).map(async ([key, value]) => await value());
    Promise.all(promises)
      .then(() => interaction.editReply('Done'))
      .catch(() => interaction.editReply('Failed'));
  }
}
