import { cacheCurrencies } from '../services/common.js';
import { cacheCommonData, checkSchaleDB } from './checkSchaleDB.js';
import { claimDaily } from './claimDaily.js';
import { refreshNHentaiCfToken } from './refreshNhentaiCfToken.js';
import { cacheAccessToken, refreshPixivToken } from './refreshPixivToken.js';

async function initFunctions(): Promise<void> {
  // Production only
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    await cacheAccessToken(); // Cache Pixiv access token
  }

  await cacheCommonData(); // Cache common data
  await cacheCurrencies(); // Cache currencies
}

function initCronJobs(): void {
  // Production only
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    checkSchaleDB.start(); // Check SchaleDB every 1 hour
    claimDaily.start(); // Claim HoYoLAB daily everyday at 00:00 UTC+8
    refreshPixivToken.start(); // Refresh Pixiv token every 30 minutes
    refreshNHentaiCfToken.start(); // Refresh NHentai Cloudflare token every 20 minutes
  }
}

export default async function init(): Promise<void> {
  await initFunctions();
  initCronJobs();
}
