import { cacheCurrencies } from '../services/common.js';
import { cacheCommonData, checkSchaleDB } from './checkSchaleDB.js';
import { claimDaily } from './claimHoyoLabDaily.js';
import { refreshCf, refreshNHentaiCfToken } from './refreshNhentaiCfToken.js';
import { cacheAccessToken, refreshPixivToken } from './refreshPixivToken.js';
import { syosetuCheckUpdate } from './syosetuCheckUpdate.js';

async function initFunctions(): Promise<void> {
  // Production only
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    await cacheAccessToken(); // Cache Pixiv access token
    if (process.env.NHENTAI_USE_ORIGIN === 'false') await refreshCf(); // Refresh Cloudflare token
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
    if (process.env.NHENTAI_USE_ORIGIN === 'false') refreshNHentaiCfToken.start(); // Refresh NHentai Cloudflare token every 20 minutes
    syosetuCheckUpdate.start(); // Check Syosetu update every 1 hour
  }
}

export default async function init(): Promise<void> {
  await initFunctions();
  initCronJobs();
}
