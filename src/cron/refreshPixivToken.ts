import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import { PixivConstants } from '../constants/index.js';
import { cache } from '../main.js';
import Cron from '../providers/cron.js';
import { IPixivRefreshTokenResponse } from '../types/pixiv';
import { getTime } from '../utils/index.js';

const cronName = 'PIXIV REFRESH TOKEN';

function getXClientTime() {
  return new Date().toISOString();
}

function getXClientHash(time: string) {
  const hash = crypto.createHash('md5');
  hash.update(time + process.env.PIXIV_HASH_SECRET);
  return hash.digest('hex');
}

async function refreshToken(): Promise<AxiosResponse> {
  const clientTime = getXClientTime();
  const params = {
    client_id: process.env.PIXIV_CLIENT_ID || '',
    client_secret: process.env.PIXIV_CLIENT_SECRET || '',
    grant_type: 'refresh_token',
    refresh_token: process.env.PIXIV_REFRESH_TOKEN || '',
  };
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'PixivAndroidApp/5.0.64 (Android 6.0)',
    'X-Client-Time': clientTime,
    'X-Client-Hash': getXClientHash(clientTime),
  };
  return await axios.post(PixivConstants.PIXIV_AUTH_URL, new URLSearchParams(params).toString(), { headers });
}

export async function cacheAccessToken() {
  if (!process.env.BOT_ENV || process.env.BOT_ENV === 'development') return;
  if (!process.env.PIXIV_CLIENT_ID || !process.env.PIXIV_CLIENT_SECRET || !process.env.PIXIV_REFRESH_TOKEN) return;
  const response = await refreshToken();
  const pixivRes: IPixivRefreshTokenResponse = response.data;
  if (!pixivRes) return;
  console.log(`[${getTime()}] ${cronName} success`);
  const accessToken = pixivRes.access_token;
  cache.set('pixivAccessToken', accessToken, pixivRes.expires_in);
  console.log(`Access token: ${accessToken}`);
}

export const refreshPixivToken = new Cron(cronName, '0 */30 * * * *', async () => await cacheAccessToken());
