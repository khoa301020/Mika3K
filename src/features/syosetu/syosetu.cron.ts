import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Client, TextChannel } from 'discord.js';
import { SyosetuService } from './syosetu.service';
import { SyosetuConstants } from './syosetu.constants';

@Injectable()
export class SyosetuCron {
  private readonly logger = new Logger(SyosetuCron.name);

  constructor(
    private readonly syosetuService: SyosetuService,
    private readonly client: Client,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkSyosetuUpdates() {
    this.logger.log('Checking Syosetu updates...');

    try {
      const beforeUpdates = await this.syosetuService.getAllNovels();

      if (beforeUpdates.length === 0) {
        this.logger.log('No novels tracked.');
        return;
      }

      const ncodes = beforeUpdates.map((novel) => novel.ncode);
      await this.syosetuService.saveNovelInfo(ncodes);

      const afterUpdates = await this.syosetuService.getAllNovels();

      const newUpdates = afterUpdates.filter((after) =>
        beforeUpdates.some(
          (before) =>
            before.ncode === after.ncode &&
            before.metadata?.general_all_no !== after.metadata?.general_all_no,
        ),
      );

      this.logger.log(`Found ${newUpdates.length} novel update(s).`);

      for (const newUpdate of newUpdates) {
        const message = `Novel **${newUpdate.metadata?.title}** has been [updated](${SyosetuConstants.NCODE_NOVEL_BASE_URL}${newUpdate.ncode}/${newUpdate.metadata?.general_all_no})!`;

        // DM users
        if (newUpdate.followings?.users) {
          for (const userId of newUpdate.followings.users) {
            try {
              await this.client.users.send(userId, message);
            } catch (err) {
              this.logger.warn(`Could not DM user ${userId}`, err);
            }
          }
        }

        // Send to channels
        if (newUpdate.followings?.channels) {
          for (const channelId of newUpdate.followings.channels) {
            try {
              const channel = this.client.channels.cache.get(
                channelId,
              ) as TextChannel;
              if (channel) await channel.send(message);
            } catch (err) {
              this.logger.warn(`Could not send to channel ${channelId}`, err);
            }
          }
        }
      }

      this.logger.log('Syosetu update check complete.');
    } catch (err) {
      this.logger.error('Error during Syosetu update check:', err);
    }
  }
}
