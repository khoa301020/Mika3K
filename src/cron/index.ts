import { cacheCommonData, checkSchaleDB } from './checkSchaleDB.js';
import { claimDaily } from './claimDaily.js';

async function initFunctions(): Promise<void> {
  // Cache SchaleDB
  await cacheCommonData();
}

function initCronJobs(): void {
  // Check SchaleDB
  checkSchaleDB.start();
  claimDaily.start();
}

export default async function init(): Promise<void> {
  await initFunctions();
  initCronJobs();
}
