import { TextChannel } from 'discord.js';
import { bot } from '../main.js';
import Syosetu from '../models/Syosetu.js';
import Cron from '../providers/cron.js';
import { SyosetuAPI } from '../services/syosetu.js';
import { IMongooseDocumentNovel } from '../types/syosetu';
import { getTime } from '../utils/index.js';

const cronName = 'CHECK SYOSETU UPDATE';

export const syosetuCheckUpdate = new Cron(cronName, '0 0 * * * *', async () => {
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
    const message = `Novel **${newUpdate.metadata.title}** has been updated at ${getTime(
      newUpdate.metadata.general_lastup,
      'Asia/Tokyo',
    )}!`;

    // Notify to all users
    newUpdate.followings.users.forEach(async (user: string) => {
      await bot.users.send(user, message);
    });
    // Notify to all channels (@here)
    newUpdate.followings.channels.forEach(async (channel: string) => {
      await (bot.channels.cache.get(channel) as TextChannel).send(message);
    });
  });
});
