import axios from 'axios';
import { CronJob } from 'cron';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { BlueArchiveConstants } from '../constants/bluearchive.js';
import { bot, cache } from '../main.js';
import NotifyChannel from '../models/NotifyChannel.js';
import { fetchData } from '../services/bluearchive.js';
import { ICommon } from '../types/bluearchive/common.js';
import { ILocalization } from '../types/bluearchive/localization.js';

function getChanges(oldData: number | undefined, newData: number): string {
  if (!oldData) return '';
  if (oldData < newData) return `(+${newData - oldData}))`;
  else if (oldData > newData) return `(-${oldData - newData}))`;
  else return '';
}

export const checkSchaleDB = new CronJob('0 0 * * * *', async () => {
  const { data } = await axios.get('https://api.github.com/repos/lonqie/SchaleDB/branches/main');

  if (cache.get('SchaleDB') !== data.commit.sha) {
    // Cache SchaleDB
    cache.set('SchaleDB', data.commit.sha);

    // Cache localization
    const BALocalization: ILocalization = await (await axios.get(BlueArchiveConstants.LOCALIZATION_DATA_URL)).data;
    cache.set('BA_Localization', BALocalization);

    // Cache common
    const BACommon: ICommon = await (await axios.get(BlueArchiveConstants.COMMON_DATA_URL)).data;
    cache.set('BA_Common', BACommon);

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
          .setTitle(
            `[${new Date(data.commit.commit.author.date).toLocaleString('en-GB', {
              timeZone: 'Asia/Ho_Chi_Minh',
            })}] SchaleDB updated`,
          )
          .setURL(data.commit.html_url)
          .setColor('#00ff00')
          .setDescription(
            `
          ・ **Students**: ${newData.students} ${getChanges(currentData.students!, newData.students!)}
          ・ **Currencies**: ${newData.currencies} ${getChanges(currentData.currencies!, newData.currencies!)}
          ・ **Enemies**: ${newData.enemies} ${getChanges(currentData.enemies!, newData.enemies!)}
          ・ **Equipment**: ${newData.equipment} ${getChanges(currentData.equipment!, newData.equipment!)}
          ・ **Furnitures**: ${newData.furnitures} ${getChanges(currentData.furnitures!, newData.furnitures!)}
          ・ **Items**: ${newData.items} ${getChanges(currentData.items!, newData.items!)}
          ・ **Raids**: ${newData.raids} ${getChanges(currentData.raids!, newData.raids!)}
          ・ **Raid Seasons**: ${newData.raidSeasons} ${getChanges(currentData.raidSeasons!, newData.raidSeasons!)}
          ・ **Time Attacks**: ${newData.timeAttacks} ${getChanges(currentData.timeAttacks!, newData.timeAttacks!)}
          ・ **World Raids**: ${newData.worldRaids} ${getChanges(currentData.worldRaids!, newData.worldRaids!)}
          ・ **Summons**: ${newData.summons} ${getChanges(currentData.summons!, newData.summons!)}
          `,
          )
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
        console.log(
          `[${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' })}] SchaleDB updated to [${
            data.commit.sha
          }]`,
        );
      });
  }
});
