import axios from 'axios';
import { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashGroup } from 'discordx';
import { BlueArchiveConstants } from '../../constants/bluearchive.js';
import { cache } from '../../main.js';
import { fetchData } from '../../services/bluearchive.js';
import { ILocalization } from '../../types/bluearchive/localization.js';

@Discord()
@SlashGroup({ name: 'buruaka', description: 'Blue Archive commands' })
export class BlueArchiveSync {
  @SlashGroup('buruaka')
  @Slash({ name: 'sync', description: 'Sync all' })
  async syncAll(interaction: CommandInteraction): Promise<any> {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply('Only the bot owner can sync.');
    await interaction.deferReply({ ephemeral: true });
    // Cache before initialization
    const BALocalization: ILocalization = await (await axios.get(BlueArchiveConstants.LOCALIZATION_DATA_URL)).data;
    cache.set('BA_Localization', BALocalization);
    interaction.editReply('BA_Localization loaded');

    let promises: Array<Promise<any>> = Object.entries(fetchData).map(async ([key, value]) => await value());
    Promise.all(promises)
      .then(() => interaction.editReply('Done'))
      .catch((err) => {
        console.log(err);

        interaction.editReply('Failed');
      });
  }
}
