import axios from 'axios';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { BlueArchiveConstants } from '../constants/index.js';
import { bot, cache } from '../main.js';
import NotifyChannel from '../models/NotifyChannel.js';
import Cron from '../providers/cron.js';
import { fetchData } from '../services/bluearchive.js';
import { ICommon } from '../types/bluearchive/common.js';
import { ILocalization } from '../types/bluearchive/localization.js';
import { getTime } from '../utils/index.js';

const cronName = 'CHECK SCHALEDB UPDATE';

function getChanges(oldCount: number | undefined, newCount: number): string {
  if (!oldCount || oldCount === newCount) return '';
  const operator = oldCount < newCount ? '+' : '-';
  return `(${operator}${Math.abs(oldCount - newCount)})`;
}
export async function cacheCommonData(): Promise<void> {
  // Cache localization
  const BALocalization: ILocalization = await (await axios.get(BlueArchiveConstants.LOCALIZATION_DATA_URL)).data;
  cache.set('BA_Localization', BALocalization);

  // Cache common
  const BACommon: ICommon = await (await axios.get(BlueArchiveConstants.COMMON_DATA_URL)).data;
  cache.set('BA_Common', BACommon);
}

export const checkSchaleDB = new Cron(cronName, '0 0 * * * *', async () => {
  const { data } = await axios.get('https://api.github.com/repos/lonqie/SchaleDB/branches/main');

  if (cache.get('SchaleDB') !== data.commit.sha) {
    // Cache SchaleDB SHA to track changes
    cache.set('SchaleDB', data.commit.sha);

    // Cache data
    cacheCommonData();

    const currentData: { [key: string]: number | undefined } = {
      students: cache.get('BA_StudentCount'),
      currencies: cache.get('BA_CurrencyCount'),
      enemies: cache.get('BA_EnemyCount'),
      equipment: cache.get('BA_EquipmentCount'),
      furnitures: cache.get('BA_FurnitureCount'),
      items: cache.get('BA_ItemCount'),
      raids: cache.get('BA_RaidCount'),
      raidSeasons: cache.get('BA_RaidSeasonCount'),
      timeAttacks: cache.get('BA_TimeAttackCount'),
      worldRaids: cache.get('BA_WorldRaidCount'),
      summons: cache.get('BA_SummonCount'),
    };

    let promises: Array<Promise<any>> = Object.entries(fetchData).map(async ([key, value]) => await value());
    Promise.all(promises)
      .then(() => {
        // Skip send notification if this is the first time SchaleDB is cached
        if (cache.take('init')) return;

        const newData: { [key: string]: number | undefined } = {
          students: cache.get('BA_StudentCount'),
          currencies: cache.get('BA_CurrencyCount'),
          enemies: cache.get('BA_EnemyCount'),
          equipment: cache.get('BA_EquipmentCount'),
          furnitures: cache.get('BA_FurnitureCount'),
          items: cache.get('BA_ItemCount'),
          raids: cache.get('BA_RaidCount'),
          raidSeasons: cache.get('BA_RaidSeasonCount'),
          timeAttacks: cache.get('BA_TimeAttackCount'),
          worldRaids: cache.get('BA_WorldRaidCount'),
          summons: cache.get('BA_SummonCount'),
        };

        const notifyChannels = NotifyChannel.find({ notifyType: 'Blue Archive' });

        const embed = new EmbedBuilder()
          .setTitle(`[${getTime(data.commit.commit.author.date)}] SchaleDB updated`)
          .setURL(data.commit.html_url)
          .setColor('#00ff00')
          .setDescription(data.commit.commit.message)
          .addFields({
            name: 'Changes',
            value: `\`\`\`・ Students: ${newData.students} ${getChanges(currentData.students!, newData.students!)}
・ Currencies: ${newData.currencies} ${getChanges(currentData.currencies!, newData.currencies!)}
・ Enemies: ${newData.enemies} ${getChanges(currentData.enemies!, newData.enemies!)}
・ Equipment: ${newData.equipment} ${getChanges(currentData.equipment!, newData.equipment!)}
・ Furnitures: ${newData.furnitures} ${getChanges(currentData.furnitures!, newData.furnitures!)}
・ Items: ${newData.items} ${getChanges(currentData.items!, newData.items!)}
・ Raids: ${newData.raids} ${getChanges(currentData.raids!, newData.raids!)}
・ Raid Seasons: ${newData.raidSeasons} ${getChanges(currentData.raidSeasons!, newData.raidSeasons!)}
・ Time Attacks: ${newData.timeAttacks} ${getChanges(currentData.timeAttacks!, newData.timeAttacks!)}
・ World Raids: ${newData.worldRaids} ${getChanges(currentData.worldRaids!, newData.worldRaids!)}
・ Summons: ${newData.summons} ${getChanges(currentData.summons!, newData.summons!)}\`\`\``.trim(),
          })
          .setTimestamp()
          .setFooter({
            text: 'SchaleDB',
            iconURL: bot.user?.avatarURL()!,
          });
        notifyChannels.then((channels) => {
          channels.forEach((channel) => {
            (bot.channels.cache.get(channel.channelId!) as TextChannel).send({ embeds: [embed] });
          });
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        // Clear init cache
        console.log(`[${getTime()}] SchaleDB updated to [${data.commit.sha}]`);
      });
  }
});
