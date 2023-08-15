import { CronJob } from 'cron';
import { TextChannel } from 'discord.js';
import { bot } from '../main.js';
import Syosetu from '../models/Syosetu.js';
import { SyosetuAPI } from '../services/syosetu.js';
import { IMongooseDocumentNovel } from '../types/syosetu';

export const syosetuCheckUpdate = new CronJob('0 0 * * * *', async () => {
  const beforeUpdates = await Syosetu.find({}).exec();

  beforeUpdates.forEach(async (before: IMongooseDocumentNovel) => {
    const after: IMongooseDocumentNovel | null = await SyosetuAPI.saveNovelInfo(before.ncode);
    if (!after) {
      console.log(`ncode: ${before.ncode} is not found`);
      return;
    } else if (before.metadata.general_all_no !== after.metadata.general_all_no) {
      // Notify to all users
      after.followings.users.forEach(async (user: string) => {
        await bot.users.send(user, `Novel **${after.metadata.title}** has been updated!`);
      });
      // Notify to all channels (@here)
      after.followings.channels.forEach(async (channel: string) => {
        await (bot.channels.cache.get(channel) as TextChannel).send(
          `Novel **${after.metadata.title}** has been updated!`,
        );
      });
    }
  });
});
