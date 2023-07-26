import { cacheCommonData, checkSchaleDB } from './checkSchaleDB.js';
import { claimDaily } from './claimDaily.js';

async function initFunctions(): Promise<void> {
  await cacheCommonData(); // Cache common data
}

function initCronJobs(): void {
  checkSchaleDB.start(); // Check SchaleDB every 1 hour
  claimDaily.start(); // Claim HoYoLAB daily everyday at 00:00 UTC+8
  // keepAliveNHentaiCookie.start(); // Currently not working
}

export default async function init(): Promise<void> {
  await initFunctions();
  initCronJobs();
}
