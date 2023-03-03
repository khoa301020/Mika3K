import axios, { AxiosResponse } from 'axios';
import qs from 'qs';
import { GenshinConstants } from '../constants/genshin.js';
import Genshin from '../models/Genshin.js';
import { IGenshin, IGenshinAccount } from '../types/genshin.js';

export const genshinApi = {
  saveCredentials: async (userId: string, cookie: any, cookieString: string) =>
    await Genshin.findOneAndUpdate(
      { userId },
      { accountId: cookie.account_id, cookieToken: cookie.cookie_token, cookieString },
      { new: true, upsert: true },
    ),
  getUserInfo: async (userId: string): Promise<any> => await Genshin.findOne({ userId }),
  getUserAccount: async (cookie: string): Promise<AxiosResponse> =>
    await axios.get(GenshinConstants.GENSHIN_GET_USER, { headers: { cookie } }),
  selectAccount: async (userId: string, account: IGenshinAccount): Promise<any> =>
    await Genshin.findOneAndUpdate({ userId }, { selectedAccount: account }),
  redeemCode: async (user: IGenshin, code: string): Promise<AxiosResponse> => {
    const param = {
      uid: user?.selectedAccount?.game_uid,
      region: user?.selectedAccount?.region,
      lang: 'en',
      cdkey: code,
      game_biz: user?.selectedAccount?.game_biz,
      sLangKey: 'en-us',
    };
    return await axios.get(`${GenshinConstants.GENSHIN_REDEEM_CODE_API}?${qs.stringify(param)}`, {
      headers: { cookie: user.cookieString },
    });
  },
};
