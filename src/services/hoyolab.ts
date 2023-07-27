import axios from 'axios';
import qs from 'qs';
import { HoYoLABConstants } from '../constants/index.js';
import { timeout } from '../helpers/helper.js';
import HoYoLAB from '../models/HoYoLAB.js';
import { IHoYoLAB, IHoYoLABGameAccount, IHoYoLABUser, IRedeemResult, THoyoGame } from '../types/hoyolab.js';

export const hoyolabApi = {
  saveCredentials: async (
    userId: string,
    remark: string,
    cookie: string,
    selectedAccounts: Array<IHoYoLABGameAccount>,
  ): Promise<any> => {
    const hoyoUser: IHoYoLABUser = {
      remark,
      cookieString: cookie,
      gameAccounts: selectedAccounts.map((account: IHoYoLABGameAccount) =>
        Object.assign(account, {
          game: Object.entries(HoYoLABConstants.REDEEM_TARGET).find(
            ([key, value]) => value.prefix === account.game_biz.split('_')[0],
          )?.[0] as THoyoGame,
        }),
      ),
    };

    return await HoYoLAB.findOne({ userId }).then(async (user) => {
      if (!user) {
        return await HoYoLAB.create({
          userId,
          hoyoUsers: [hoyoUser],
        });
      } else {
        const hoyoUsers = user.hoyoUsers;
        const index = hoyoUsers.findIndex((user) => user.remark === remark);
        if (index === -1) {
          hoyoUsers.push(hoyoUser);
        } else {
          hoyoUsers[index] = hoyoUser;
        }
        return await HoYoLAB.findOneAndUpdate({ userId }, { hoyoUsers });
      }
    });
  },
  getUserInfo: async (userId: string): Promise<any> => await HoYoLAB.findOne({ userId }),
  selectAccount: async (userId: string, target: THoyoGame, account: IHoYoLABGameAccount): Promise<any> =>
    await HoYoLAB.findOneAndUpdate({ userId }, { [`${target}Account`]: account }),
  redeemCode: async (user: IHoYoLAB, target: THoyoGame, code: string): Promise<any> => {
    if (!user || !user.hoyoUsers || user.hoyoUsers.length === 0) return Promise.reject('User invalid.');
    let result: Array<IRedeemResult> = [];
    for (const hoyoUser of user.hoyoUsers) {
      const redeemAccounts: Array<IHoYoLABGameAccount> = hoyoUser.gameAccounts.filter(
        (account) => account.game === target,
      );
      if (redeemAccounts.length === 0) continue;

      result.push({
        remark: hoyoUser.remark,
        accounts: [],
      });

      for (const account of redeemAccounts) {
        const param = {
          t: Date.now(),
          uid: account.game_uid,
          region: account.region,
          lang: 'en',
          cdkey: code,
          game_biz: account.game_biz,
          sLangKey: 'en-us',
        };

        const res = await axios.get(`${HoYoLABConstants.REDEEM_CODE_API[target]}?${qs.stringify(param)}`, {
          headers: { cookie: hoyoUser.cookieString },
        });

        result[result.length - 1].accounts.push({
          nickname: account.nickname,
          uid: account.game_uid,
          code: res.data.retcode,
          message: res.data.message,
        });

        await timeout(5555);
      }
    }

    return result;
  },
};
