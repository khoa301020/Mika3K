import axios, { AxiosResponse, RawAxiosRequestHeaders } from 'axios';
import { HydratedDocument } from 'mongoose';
import qs from 'qs';
import { HoYoLABConstants } from '../constants/index.js';
import HoYoLAB from '../models/HoYoLAB.js';
import { IHoYoLAB, IHoYoLABGameAccount, IHoYoLABUser, IRedeemResult, THoyoGame } from '../types/hoyolab.js';
import { generateDS, timeout } from '../utils/index.js';

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
            ([, value]) => value.prefix === account.game_biz.split('_')[0],
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
  getUserInfo: async (userId: string): Promise<HydratedDocument<IHoYoLAB> | null> =>
    await HoYoLAB.findOne({ userId }).lean(),
  getAllOtherUsers: async (userIdToExclude: string): Promise<Array<HydratedDocument<IHoYoLAB>> | null> =>
    await HoYoLAB.find({ userId: { $ne: userIdToExclude } }).lean(),
  redeemCode: async (user: IHoYoLAB, target: THoyoGame, code: string): Promise<any> => {
    if (!user || !user.hoyoUsers || user.hoyoUsers.length === 0) throw '❌ Account data not found.';
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
  deleteAccount: async (userId: string, remark: string): Promise<any> => {
    return await HoYoLAB.findOne({ userId }).then(async (user) => {
      if (!user)
        throw '❌ User not found. Please save the cookie first or use `/hoyolab info` to see info containing remarks.';
      const hoyoUsers = user.hoyoUsers;
      const index = hoyoUsers.findIndex((user) => user.remark === remark);
      if (index === -1) throw '❌ Remark not found.';
      hoyoUsers.splice(index, 1);
      return await HoYoLAB.findOneAndUpdate({ userId }, { hoyoUsers });
    });
  },
  getNote: async (gameAccount: IHoYoLABGameAccount, cookie: string): Promise<AxiosResponse> => {
    const headers: RawAxiosRequestHeaders = {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'sec-ch-ua': '"Chromium";v="112", "Microsoft Edge";v="112", "Not:A-Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.46',
      'x-rpc-app_version': '1.5.0',
      'x-rpc-client_type': '5',
      'x-rpc-language': 'en-us',
      DS: generateDS(),
      Cookie: cookie,
    };

    return await axios.get(
      `${HoYoLABConstants.HOYOLAB_NOTE_API(gameAccount.game!)}?server=${gameAccount.region}&role_id=${
        gameAccount.game_uid
      }`,
      { headers },
    );
  },
};
