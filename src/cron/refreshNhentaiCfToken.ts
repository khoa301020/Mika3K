import { CronJob } from 'cron';
import { NHentaiConstants } from '../constants/index.js';
import { simulateNHentaiRequest } from '../services/nhentai.js';
import { currentTime } from '../utils/index.js';

const cronName = 'NHentai Cloudflare refresh token';

export const refreshNHentaiCfToken = new CronJob('0 */20 * * * *', () => {
  const randomId = Math.floor(Math.random() * 400000) + 1;
  simulateNHentaiRequest(NHentaiConstants.NHENTAI_GALLERY_ENDPOINT(randomId))
    .then(() => console.log(`[${currentTime()}] ${cronName} done.`))
    .catch((e) => console.log(`[${currentTime()}] ${cronName} failed. ${e.message}`));
});
