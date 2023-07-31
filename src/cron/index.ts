import { cacheCurrencies } from '../services/common.js';
import { cacheCommonData, checkSchaleDB } from './checkSchaleDB.js';
import { claimDaily } from './claimDaily.js';
import { keepAliveNHentaiCookie } from './keepAliveNHentaiCookie.js';

async function initFunctions(): Promise<void> {
  await cacheCommonData(); // Cache common data
  await cacheCurrencies(); // Cache currencies
}

function initCronJobs(): void {
  checkSchaleDB.start(); // Check SchaleDB every 1 hour
  claimDaily.start(); // Claim HoYoLAB daily everyday at 00:00 UTC+8
  if (!(process.env.NHENTAI_USE_ORIGIN === 'true')) keepAliveNHentaiCookie.start(); // Currently not working, set NHENTAI_USE_ORIGIN to true to disable this
}

export default async function init(): Promise<void> {
  await initFunctions();
  initCronJobs();
}
