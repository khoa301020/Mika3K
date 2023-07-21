import axios from 'axios';
import { CronJob } from 'cron';
import { HoYoLABConstants } from '../constants/hoyolab.js';
import HoYoLAB from '../models/HoYoLAB.js';
import { IHoYoLAB, IHoYoLABAccount } from '../types/hoyolab';

export const claimDaily = new CronJob('0 0 16 * * *', async () => {
  // export const claimDaily = new CronJob('0 * * * * *', async () => {
  const listUsers: Array<IHoYoLAB> = await HoYoLAB.find({}).lean();
  console.log(`[ClaimDaily] Found ${listUsers.length} users`);

  for (const user of listUsers) {
    let gameAccounts: Array<IHoYoLABAccount> = [];
    if (user.genshinAccount) gameAccounts.push(Object.assign(user.genshinAccount, { game: 'genshin' }));
    if (user.hi3Account) gameAccounts.push(Object.assign(user.hi3Account, { game: 'hi3' }));
    if (user.hsrAccount) gameAccounts.push(Object.assign(user.hsrAccount, { game: 'hsr' }));

    if (gameAccounts.length === 0) continue;

    console.log(`[ClaimDaily] Found ${gameAccounts.length} accounts for user ${user.userId}`);

    for (const account of gameAccounts) {
      let { data } = await axios.post(
        HoYoLABConstants.DAILY_CLAIM_API(account.game!),
        {},
        {
          headers: {
            Cookie: user.cookieString,
          },
        },
      );

      if (data.data?.gt_result && data.data?.gt_result?.is_risk === true) {
        data = await axios
          .post(
            HoYoLABConstants.DAILY_CLAIM_API(account.game!),
            {},
            {
              headers: {
                Cookie: user.cookieString,
                'X-Rpc-Challenge': data.data.gt_result.challenge,
              },
            },
          )
          .then((res) => res.data);
      }

      switch (data.retcode) {
        case -5003:
          console.log(
            `[ClaimDaily] User ${user.userId}'s ${account.game?.toUpperCase()} account has already claimed daily`,
          );
          break;
        case 0:
          console.log(`[ClaimDaily] Claimed daily for ${account.game?.toUpperCase()} user ${user.userId}`);
          break;

        default:
          console.log(
            `[ClaimDaily] Failed to claim daily for ${account.game?.toUpperCase()} user ${user.userId}, message: ${
              data.message
            }`,
          );
          break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log('[ClaimDaily] Done');
});
