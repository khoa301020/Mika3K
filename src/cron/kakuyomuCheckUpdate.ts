import { TextChannel } from 'discord.js';
import KakuyomuConstants from '../constants/kakuyomu.js';
import { bot } from '../main.js';
import Kakuyomu from '../models/Kakuyomu.js';
import Cron from '../providers/cron.js';
import { KakuyomuAPI } from '../services/kakuyomu.js';
import { IKakuyomuDocument } from '../types/kakuyomu';
import { getTime } from '../utils/index.js';

const cronName = 'CHECK KAKUYOMU UPDATE';

export const kakuyomuCheckUpdate = new Cron(cronName, '0 0 * * * *', async () => {
  const beforeUpdates = await Kakuyomu.find({}).exec();

  const novelIds = beforeUpdates.map((novel: IKakuyomuDocument) => novel.novelId);

  await KakuyomuAPI.saveNovelInfo(novelIds);

  const afterUpdates = await Kakuyomu.find({}).exec();

  const newUpdates = afterUpdates.filter((after: IKakuyomuDocument) =>
    beforeUpdates.some(
      (before: IKakuyomuDocument) =>
        before.novelId === after.novelId && before.novelData.chaptersCount !== after.novelData.chaptersCount,
    ),
  );

  console.log(`[${getTime()}] ${cronName} found ${newUpdates.length} new updates.`);

  newUpdates.forEach(async (newUpdate: IKakuyomuDocument) => {
    const lastEpisode = newUpdate.novelData.chapters.pop()?.episodes.pop();
    const message = `Novel **${newUpdate.novelData.title}** has been ${
      lastEpisode
        ? `[updated](${KakuyomuConstants.NOVEL_EPISODE_URL(newUpdate.novelId, lastEpisode.episodeId)})`
        : 'updated'
    } at ${getTime(newUpdate.novelData.lastUpdate, 'Asia/Tokyo')}!`;

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
