import { CronJob } from 'cron';
import { TextChannel } from 'discord.js';
import { bot } from '../main.js';
import Syosetu from '../models/Syosetu.js';
import { SyosetuAPI } from '../services/syosetu.js';
import { IMongooseDocumentNovel } from '../types/syosetu';
import { getTime } from '../utils/index.js';

const cronName = 'Check update Syosetu';

export const syosetuCheckUpdate = new CronJob('0 0 * * * *', async () => {
  console.log(`[${getTime()}] ${cronName} started.`);

  const beforeUpdates = await Syosetu.find({}).exec();

  const ncodes = beforeUpdates.map((novel: IMongooseDocumentNovel) => novel.ncode);

  await SyosetuAPI.saveNovelInfo(ncodes);

  const afterUpdates = await Syosetu.find({}).exec();

  const newUpdates = afterUpdates.filter((after: IMongooseDocumentNovel) =>
    beforeUpdates.some(
      (before: IMongooseDocumentNovel) =>
        before.ncode === after.ncode && before.metadata.general_all_no !== after.metadata.general_all_no,
    ),
  );

  console.log(`[${getTime()}] ${cronName} found ${newUpdates.length} new updates.`);

  newUpdates.forEach(async (newUpdate: IMongooseDocumentNovel) => {
    // Notify to all users
    newUpdate.followings.users.forEach(async (user: string) => {
      await bot.users.send(
        user,
        `Novel **${newUpdate.metadata.title}** has been updated at ${getTime(
          newUpdate.metadata.general_lastup,
          'Asia/Tokyo',
        )}!`,
      );
    });
    // Notify to all channels (@here)
    newUpdate.followings.channels.forEach(async (channel: string) => {
      await (bot.channels.cache.get(channel) as TextChannel).send(
        `Novel **${newUpdate.metadata.title}** has been updated at ${getTime(
          newUpdate.metadata.general_lastup,
          'Asia/Tokyo',
        )}!`,
      );
    });
  });

  console.log(`[${getTime()}] ${cronName} finished.`);
});
