import axios from 'axios';
import { CronJob } from 'cron';
import { HoYoLABConstants } from '../constants/index.js';
import { bot } from '../main.js';
import HoYoLAB from '../models/HoYoLAB.js';
import { IHoYoLAB, IRedeemResultAccount } from '../types/hoyolab.js';
import { currentTime, timeout } from '../utils/index.js';

const cronName = 'HoYoLAB Daily login';

export const claimDaily = new CronJob('0 0 16 * * *', async () => {
  // export const claimDaily = new CronJob('0 * * * * *', async () => {
  const listUsers: Array<IHoYoLAB> = await HoYoLAB.find({}).lean();
  console.log(`[${currentTime()} - ${cronName}] Found ${listUsers.length} users`);

  for (const user of listUsers) {
    if (user.hoyoUsers.length === 0) continue;

    let result: Array<any> = [];

    console.log(`[${currentTime()} - ${cronName}] Found ${user.hoyoUsers.length} HoYoLAB users for ${user.userId}`);

    for (const hoyoUser of user.hoyoUsers) {
      if (hoyoUser.gameAccounts.length === 0) continue;

      result.push({
        remark: hoyoUser.remark,
        accounts: [],
      });

      console.log(
        `[${currentTime()} - ${cronName}] Found ${hoyoUser.gameAccounts.length} game accounts for ${hoyoUser.remark}`,
      );

      for (const account of hoyoUser.gameAccounts) {
        let { data } = await axios.post(
          HoYoLABConstants.DAILY_CLAIM_API(account.game!),
          {},
          {
            headers: {
              Cookie: hoyoUser.cookieString,
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
                  Cookie: hoyoUser.cookieString,
                  'X-Rpc-Challenge': data.data.gt_result.challenge,
                },
              },
            )
            .then((res) => res.data);
        }

        let symbol: string;

        switch (data.retcode) {
          case -5003:
            console.log(
              `[${new Date().toLocaleString('en-GB', {
                timeZone: 'Asia/Ho_Chi_Minh',
              })} - ${cronName}] ${account.game?.toUpperCase()} account [${account.game_uid}] ${
                account.nickname
              } has already claimed daily`,
            );
            symbol = '⏺';
            break;
          case 0:
            console.log(
              `[${new Date().toLocaleString('en-GB', {
                timeZone: 'Asia/Ho_Chi_Minh',
              })} - ${cronName}] Claimed daily for ${account.game?.toUpperCase()} account [${account.game_uid}] ${
                account.nickname
              }`,
            );
            symbol = '✅';
            break;

          default:
            console.log(
              `[${new Date().toLocaleString('en-GB', {
                timeZone: 'Asia/Ho_Chi_Minh',
              })} - ${cronName}] Failed to claim daily for ${account.game?.toUpperCase()} user ${
                user.userId
              }, message: ${data.message}`,
            );
            symbol = '❌';
            break;
        }

        result[result.length - 1].accounts.push({
          nickname: account.nickname,
          game: account.game,
          uid: account.game_uid,
          message: symbol,
        });

        await timeout(3333);
      }
    }

    bot.users.send(user.userId, {
      embeds: [
        {
          title: 'HoYoLAB Daily Claim',
          description: `Claimed daily for ${user.hoyoUsers.length} HoYoLAB user${user.hoyoUsers.length > 1 ? 's' : ''}`,
          fields: result.map((res) => ({
            name: res.remark,
            value: res.accounts
              .map(
                (account: IRedeemResultAccount) =>
                  `- [${account.game?.toUpperCase()}${account.uid}] ${account.nickname} ${account.message}`,
              )
              .join('\n'),
          })),
        },
      ],
    });
  }

  console.log(`[${currentTime()} - ${cronName}] Done`);
});
