import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppHttpService } from '../../shared/http';
import { AppCacheService } from '../../shared/cache';
import { BaService } from './ba.service';
import { NotifyChannel, type NotifyChannelDocument } from './ba.schemas';
import * as C from './ba.constants';

@Injectable()
export class BaCronService {
  private readonly logger = new Logger(BaCronService.name);

  constructor(
    private readonly httpService: AppHttpService,
    private readonly cacheService: AppCacheService,
    private readonly baService: BaService,
    private readonly client: Client,
    @InjectModel(NotifyChannel.name)
    private readonly notifyModel: Model<NotifyChannelDocument>,
  ) {
    // Mark as init so first sync doesn't trigger notifications
    void this.cacheService.set('BA_init', true);
  }

  @Cron('0 0 * * * *') // Every hour
  async checkSchaleDBUpdate() {
    try {
      const { data } = await this.httpService.get(
        'https://api.github.com/repos/lonqie/SchaleDB/branches/main',
      );
      const sha = data.commit.sha;
      if ((await this.cacheService.get('SchaleDB_SHA')) === sha) return;

      await this.cacheService.set('SchaleDB_SHA', sha);
      await this.baService.cacheCommonData();

      const currentCounts = await this.getDataCounts();
      await this.baService.syncAll();
      const newCounts = await this.getDataCounts();

      // Skip notification on first sync
      if (await this.cacheService.get('BA_init')) {
        await this.cacheService.del('BA_init');
        this.logger.log(`SchaleDB initial sync complete [${sha}]`);
        return;
      }

      // Build notification embed
      const embed = new EmbedBuilder()
        .setTitle(`SchaleDB updated`)
        .setURL(data.commit.html_url)
        .setColor(0x00ff00)
        .setDescription(data.commit.commit.message)
        .addFields({
          name: 'Changes',
          value: `\`\`\`${Object.entries(newCounts)
            .map(([key, val]) => {
              const old = currentCounts[key] ?? 0;
              const diff = val - old;
              return `・ ${key}: ${val}${diff !== 0 ? ` (${diff > 0 ? '+' : ''}${diff})` : ''}`;
            })
            .join('\n')}\`\`\``,
        })
        .setTimestamp()
        .setFooter({
          text: 'SchaleDB',
          iconURL: this.client.user?.avatarURL() ?? undefined,
        });

      const channels = await this.notifyModel.find({
        notifyType: C.BA_SCHALEDB_UPDATE,
      });
      for (const ch of channels) {
        try {
          const channel = this.client.channels.cache.get(ch.channelId) as
            | TextChannel
            | undefined;
          if (channel) await channel.send({ embeds: [embed] });
        } catch {
          /* skip unreachable channels */
        }
      }

      this.logger.log(`SchaleDB updated to [${sha}]`);
    } catch (err: any) {
      this.logger.error(`SchaleDB check failed: ${err.message}`);
    }
  }

  private async getDataCounts(): Promise<Record<string, number>> {
    return {
      Students: (await this.cacheService.get<number>('BA_StudentsCount')) ?? 0,
      Currencies:
        (await this.cacheService.get<number>('BA_CurrenciesCount')) ?? 0,
      Enemies: (await this.cacheService.get<number>('BA_EnemiesCount')) ?? 0,
      Equipments:
        (await this.cacheService.get<number>('BA_EquipmentsCount')) ?? 0,
      Furnitures:
        (await this.cacheService.get<number>('BA_FurnituresCount')) ?? 0,
      Items: (await this.cacheService.get<number>('BA_ItemsCount')) ?? 0,
      Raids: (await this.cacheService.get<number>('BA_RaidsCount')) ?? 0,
      RaidSeasons:
        (await this.cacheService.get<number>('BA_RaidSeasonsCount')) ?? 0,
      TimeAttacks:
        (await this.cacheService.get<number>('BA_TimeAttacksCount')) ?? 0,
      WorldRaids:
        (await this.cacheService.get<number>('BA_WorldRaidsCount')) ?? 0,
      Summons: (await this.cacheService.get<number>('BA_SummonsCount')) ?? 0,
    };
  }
}
