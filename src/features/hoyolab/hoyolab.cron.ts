import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HoyolabService } from './hoyolab.service';
import { AppHttpService } from '../../shared/http';
import { HoYoLABConstants } from './hoyolab.constants';
import { THoyoGame } from './types/hoyolab';
import { Client } from 'discord.js';

@Injectable()
export class HoyolabCron {
  private readonly logger = new Logger(HoyolabCron.name);

  constructor(
    private readonly hoyolabService: HoyolabService,
    private readonly httpService: AppHttpService,
    private readonly client: Client,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleDailySign() {
    this.logger.log('Executing daily HoYoLAB sign-in...');

    try {
      // Logic for all users
      const users = await this.hoyolabService.getAllOtherUsers('');
      if (!users || users.length === 0) {
        this.logger.log('No HoYoLAB users found for auto sign-in.');
        return;
      }

      for (const user of users) {
        if (!user.hoyoUsers || user.hoyoUsers.length === 0) continue;

        for (const hoyoUser of user.hoyoUsers) {
          if (!hoyoUser.gameAccounts || hoyoUser.gameAccounts.length === 0)
            continue;

          for (const account of hoyoUser.gameAccounts) {
            const game = account.game as THoyoGame;
            if (!game || !HoYoLABConstants.REDEEM_TARGET[game]) continue;

            try {
              const url = HoYoLABConstants.DAILY_CLAIM_API(game);

              await this.httpService.post(
                url,
                { act_id: HoYoLABConstants.REDEEM_TARGET[game].actId },
                { headers: { cookie: hoyoUser.cookieString } },
              );

              // Delay to prevent rate limits or spamming
              await new Promise((resolve) => setTimeout(resolve, 5555));
            } catch (error) {
              this.logger.error(
                `Failed to sign in for ${account.nickname} (${game}).`,
                error,
              );
            }
          }
        }
      }

      this.logger.log('Daily HoYoLAB sign-in complete.');
    } catch (e) {
      this.logger.error('Error during HoYoLAB daily sign-in process:', e);
    }
  }
}
