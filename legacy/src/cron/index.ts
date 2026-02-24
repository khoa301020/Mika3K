import { cacheCommonData, checkSchaleDB } from './checkSchaleDB.js';
import { claimDaily } from './claimHoyoLabDaily.js';
import { cacheAccessToken, refreshPixivToken } from './refreshPixivToken.js';
import { syosetuCheckUpdate } from './syosetuCheckUpdate.js';

async function initFunctions(): Promise<void> {
  await cacheCommonData().then(() => console.log('Cached SchaleDB common data')); // Cache common data

  // Production only
  if (process.env.BOT_ENV && process.env.BOT_ENV === 'production') {
    await cacheAccessToken(); // Cache Pixiv access token
  }
}

function initCronJobs(): void {
  // Production only
  if (process.env.BOT_ENV && process.env.BOT_ENV === 'production') {
    checkSchaleDB.start(); // Check SchaleDB every 1 hour
    claimDaily.start(); // Claim HoYoLAB daily everyday at 00:00 UTC+8
    refreshPixivToken.start(); // Refresh Pixiv token every 30 minutes
    syosetuCheckUpdate.start(); // Check update Syosetu every 1 hour
  }
}

export default async function init(): Promise<void> {
  await initFunctions();
  initCronJobs();
}
