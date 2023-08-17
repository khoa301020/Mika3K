import { NHentaiConstants } from '../constants/index.js';
import Cron from '../providers/cron.js';
import { simulateNHentaiRequest } from '../services/nhentai.js';
import { getTime } from '../utils/index.js';

const cronName = 'NHENTAI CF TOKEN REFRESH';

export const refreshCf = async () => {
  const randomId = Math.floor(Math.random() * 400000) + 1;
  try {
    await simulateNHentaiRequest(NHentaiConstants.NHENTAI_GALLERY_ENDPOINT(randomId));
    return console.log(`[${getTime()}] ${cronName} done.`);
  } catch (e: any) {
    return console.log(`[${getTime()}] ${cronName} failed. ${e.message}`);
  }
};

export const refreshNHentaiCfToken = new Cron(cronName, '0 */20 * * * *', async () => await refreshCf());
