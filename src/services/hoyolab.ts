import axios, { AxiosResponse } from 'axios';
import qs from 'qs';
import { HoYoLABConstants } from '../constants/hoyolab.js';
import HoYoLAB from '../models/HoYoLAB.js';
import { IHoYoLAB, IHoYoLABAccount, TRedeemTarget } from '../types/hoyolab.js';

export const hoyolabApi = {
  saveCredentials: async (userId: string, cookie: any, cookieString: string) =>
    await HoYoLAB.findOneAndUpdate(
      { userId },
      { accountId: cookie.account_id, cookieToken: cookie.cookie_token, cookieString },
      { new: true, upsert: true },
    ),
  getUserInfo: async (userId: string): Promise<any> => await HoYoLAB.findOne({ userId }),
  getUserAccount: async (cookie: string): Promise<AxiosResponse> =>
    await axios.get(HoYoLABConstants.HOYOLAB_GET_USER, { headers: { cookie } }),
  selectAccount: async (userId: string, target: TRedeemTarget, account: IHoYoLABAccount): Promise<any> =>
    await HoYoLAB.findOneAndUpdate({ userId }, { [`${target}Account`]: account }),
  redeemCode: async (user: IHoYoLAB, target: TRedeemTarget, code: string): Promise<AxiosResponse> => {
    const param = {
      t: Date.now(),
      uid: user?.[`${target}Account`]?.game_uid,
      region: user?.[`${target}Account`]?.region,
      lang: 'en',
      cdkey: code,
      game_biz: user?.[`${target}Account`]?.game_biz,
      sLangKey: 'en-us',
    };
    return await axios.get(`${HoYoLABConstants.REDEEM_CODE_API[target]}?${qs.stringify(param)}`, {
      headers: { cookie: user.cookieString },
    });
  },
};
