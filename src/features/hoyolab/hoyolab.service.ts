import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppHttpService } from '../../shared/http';
import { AppCacheService } from '../../shared/cache';
import { Hoyolab, HoyolabDocument } from './hoyolab.schema';
import { HoYoLABConstants } from './hoyolab.constants';
import {
  IHoYoLABUser,
  IHoYoLABGameAccount,
  THoyoGame,
  IRedeemResult,
} from './types/hoyolab';
import * as crypto from 'crypto';

@Injectable()
export class HoyolabService {
  private readonly logger = new Logger(HoyolabService.name);

  constructor(
    @InjectModel(Hoyolab.name)
    private readonly hoyolabModel: Model<HoyolabDocument>,
    private readonly httpService: AppHttpService,
    private readonly cacheService: AppCacheService,
  ) {}

  private generateDS(): string {
    // Ported from v1 `generateDS`
    const salt = '6s25p5ox5y14umn1p61aqyyvbvvl3lrt';
    const t = Math.floor(Date.now() / 1000);
    const r = crypto.randomBytes(3).toString('hex').toLowerCase();
    const hash = crypto
      .createHash('md5')
      .update(`salt=${salt}&t=${t}&r=${r}`)
      .digest('hex');
    return `${t},${r},${hash}`;
  }

  async saveCredentials(
    userId: string,
    remark: string,
    cookie: string,
    selectedAccounts: Array<IHoYoLABGameAccount>,
  ): Promise<HoyolabDocument> {
    const hoyoUser: IHoYoLABUser = {
      remark,
      cookieString: cookie,
      gameAccounts: selectedAccounts.map((account) =>
        Object.assign(account, {
          game: Object.entries(HoYoLABConstants.REDEEM_TARGET).find(
            ([, value]: [string, any]) =>
              value.prefix === account.game_biz.split('_')[0],
          )?.[0] as THoyoGame,
        }),
      ),
    };

    const user = await this.hoyolabModel.findOne({ userId });
    if (!user) {
      return await this.hoyolabModel.create({
        userId,
        hoyoUsers: [hoyoUser],
      });
    } else {
      const hoyoUsers = user.hoyoUsers;
      const index = hoyoUsers.findIndex((u) => u.remark === remark);
      if (index === -1) {
        hoyoUsers.push(hoyoUser);
      } else {
        hoyoUsers.splice(index, 1);
        hoyoUsers.push(hoyoUser);
      }
      return (await this.hoyolabModel.findOneAndUpdate(
        { userId },
        { hoyoUsers },
        { returnDocument: 'after' },
      )) as HoyolabDocument;
    }
  }

  async getUserInfo(userId: string): Promise<HoyolabDocument | null> {
    return await this.hoyolabModel.findOne({ userId }).lean();
  }

  async getAllOtherUsers(
    userIdToExclude: string,
  ): Promise<Array<HoyolabDocument>> {
    return await this.hoyolabModel
      .find({ userId: { $ne: userIdToExclude } })
      .lean();
  }

  async deleteAccount(
    userId: string,
    remark: string,
  ): Promise<HoyolabDocument> {
    const user = await this.hoyolabModel.findOne({ userId });
    if (!user) {
      throw new Error(
        '❌ User not found. Please save the cookie first or use `/hoyolab info` to see info containing remarks.',
      );
    }
    const hoyoUsers = user.hoyoUsers;
    const index = hoyoUsers.findIndex((u) => u.remark === remark);
    if (index === -1) throw new Error('❌ Remark not found.');
    hoyoUsers.splice(index, 1);
    return (await this.hoyolabModel.findOneAndUpdate(
      { userId },
      { hoyoUsers },
      { returnDocument: 'after' },
    )) as HoyolabDocument;
  }

  async getNote(
    gameAccount: IHoYoLABGameAccount,
    cookie: string,
  ): Promise<any> {
    const headers = {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'sec-ch-ua':
        '"Chromium";v="112", "Microsoft Edge";v="112", "Not:A-Brand";v="99"',
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
      DS: this.generateDS(),
      Cookie: cookie,
    };

    const url = `${HoYoLABConstants.HOYOLAB_NOTE_API(gameAccount.game!)}?server=${gameAccount.region}&role_id=${
      gameAccount.game_uid
    }`;

    try {
      const response = await this.httpService.get(url, { headers });
      return response;
    } catch (e) {
      this.logger.error(`Error fetching note for ${gameAccount.nickname}:`, e);
      throw e;
    }
  }

  async redeemCode(
    user: HoyolabDocument,
    target: THoyoGame,
    code: string,
  ): Promise<Array<IRedeemResult>> {
    if (!user || !user.hoyoUsers?.length)
      throw new Error('❌ Account data not found.');
    const result: Array<IRedeemResult> = [];

    for (const hoyoUser of user.hoyoUsers) {
      const redeemAccounts: Array<IHoYoLABGameAccount> =
        hoyoUser.gameAccounts.filter((account: any) => account.game === target);
      if (redeemAccounts.length === 0) continue;

      result.push({
        remark: hoyoUser.remark!,
        accounts: [],
      });

      for (const account of redeemAccounts) {
        const param = new URLSearchParams({
          t: Date.now().toString(),
          uid: account.game_uid,
          region: account.region,
          lang: 'en',
          cdkey: code,
          game_biz: account.game_biz,
          sLangKey: 'en-us',
        }).toString();

        try {
          const res = await this.httpService.get(
            `${HoYoLABConstants.REDEEM_CODE_API[target]}?${param}`,
            { headers: { cookie: hoyoUser.cookieString } },
          );

          result[result.length - 1].accounts.push({
            nickname: account.nickname,
            uid: account.game_uid,
            code: res.data?.retcode,
            message: res.data?.message,
          });

          // Wait to prevent rate limits
          await new Promise((r) => setTimeout(r, 5555));
        } catch {
          result[result.length - 1].accounts.push({
            nickname: account.nickname,
            uid: account.game_uid,
            code: -1,
            message: 'HTTP Error',
          });
        }
      }
    }

    return result;
  }
}
