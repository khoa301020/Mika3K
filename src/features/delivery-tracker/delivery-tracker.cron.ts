import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Client } from 'discord.js';
import { DeliveryTrackerConstants } from './delivery-tracker.constants';
import { DeliveryTrackerEmbeds } from './delivery-tracker.embeds';
import { DeliveryTrackerHelper } from './delivery-tracker.helper';
import { DeliveryTrackerService } from './delivery-tracker.service';
import { ITrackerProvider } from './providers/tracker-provider.interface';
import { DeliveryTrackerDocument } from './schemas/delivery-tracker.schema';

@Injectable()
export class DeliveryTrackerCron {
  private readonly logger = new Logger(DeliveryTrackerCron.name);

  constructor(
    private readonly trackerService: DeliveryTrackerService,
    private readonly trackerEmbeds: DeliveryTrackerEmbeds,
    private readonly trackerHelper: DeliveryTrackerHelper,
    private readonly client: Client,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /** Register one cron job per provider */
  onModuleInit() {
    for (const provider of this.trackerHelper.getAllProviders()) {
      const jobName = `delivery-tracker-poll-${provider.providerName}`;

      const job = new CronJob(
        provider.pollingCron,
        () => this.pollProvider(provider),
        null,
        true,
        DeliveryTrackerConstants.TIMEZONE,
      );

      this.schedulerRegistry.addCronJob(jobName, job);
      this.logger.log(
        `Registered polling cron for ${provider.providerName}: ${provider.pollingCron}`,
      );
    }
  }

  // ─── Code-Centric Polling ─────────────────────────────────────

  private async pollProvider(provider: ITrackerProvider): Promise<void> {
    this.logger.log(`Polling ${provider.providerName} trackers...`);

    try {
      // 1. Get distinct active tracking codes for this provider
      const codes = await this.trackerService.getDistinctActiveCodes(
        provider.providerName,
      );

      if (!codes.length) {
        this.logger.debug(
          `No active ${provider.providerName} codes to poll.`,
        );
        return;
      }

      this.logger.log(
        `Polling ${codes.length} unique ${provider.providerName} code(s)...`,
      );

      for (const code of codes) {
        await this.pollSingleCode(code, provider);
        await new Promise((r) => setTimeout(r, provider.pollingDelayMs));
      }

      // Check stale trackers after polling
      await this.checkStaleTrackers();

      this.logger.log(`${provider.providerName} polling complete.`);
    } catch (error) {
      this.logger.error(
        `Error during ${provider.providerName} polling:`,
        error,
      );
    }
  }

  /** Fetch once for a code, then fan out to all tracker docs for that code */
  private async pollSingleCode(
    code: string,
    provider: ITrackerProvider,
  ): Promise<void> {
    try {
      // 2. Fetch from provider API once
      const fetchedRecords = await this.trackerHelper.fetchRecords(
        code,
        provider.providerName,
      );

      if (!fetchedRecords.length) {
        // Still touch all docs so lastPolledAt updates
        const docs = await this.trackerService.getActiveTrackersByCode(code);
        for (const doc of docs) {
          await this.trackerService.touchPolled(code, doc.ownerId);
        }
        return;
      }

      const newStatus = provider.resolveStatus(fetchedRecords);

      // 3. Get all active tracker docs for this code
      const docs = await this.trackerService.getActiveTrackersByCode(code);

      for (const doc of docs) {
        await this.updateSingleDoc(doc, fetchedRecords, newStatus);
      }

      // 4. Terminal fan-out — mark ALL docs ended
      if (DeliveryTrackerConstants.TERMINAL_STATUSES.includes(newStatus)) {
        await this.trackerService.markAllEndedByCode(code);
        this.logger.log(
          `All trackers for ${code} marked ended: ${newStatus}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error polling code ${code}:`, error);
    }
  }

  /** Diff & update a single tracker doc, broadcast new records */
  private async updateSingleDoc(
    doc: DeliveryTrackerDocument,
    fetchedRecords: any[],
    newStatus: any,
  ): Promise<void> {
    const newRecords = this.trackerHelper.diffRecords(
      doc.records,
      fetchedRecords,
    );

    if (!newRecords.length) {
      await this.trackerService.touchPolled(
        doc.trackingCode,
        doc.ownerId,
      );
      return;
    }

    await this.trackerService.appendRecords(
      doc.trackingCode,
      doc.ownerId,
      newRecords,
      newStatus,
    );

    // Broadcast each new record to approved targets
    for (const record of newRecords) {
      const embed = this.trackerEmbeds.trackingUpdateEmbed(doc, record);

      for (const target of doc.broadcastTargets) {
        if (target.status !== 'approved') continue;

        try {
          if (target.type === 'channel' && target.channelId) {
            const channel = await this.client.channels.fetch(
              target.channelId,
            );
            if (channel && 'send' in channel) {
              await (channel as any).send({ embeds: [embed] });
            }
          } else if (target.type === 'dm') {
            const user = await this.client.users.fetch(target.userId);
            await user.send({ embeds: [embed] });
          }
        } catch (err) {
          this.logger.warn(
            `Failed to broadcast to ${target.type}:${target.userId}: ${err}`,
          );
        }
      }
    }
  }

  // ─── Stale Tracker Checks ────────────────────────────────────

  private async checkStaleTrackers(): Promise<void> {
    const staleTrackers = await this.trackerService.getStaleTrackers(
      DeliveryTrackerConstants.STALE_WARNING_DAYS,
    );

    for (const tracker of staleTrackers) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(tracker.lastUpdatedAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysSinceUpdate >= DeliveryTrackerConstants.AUTO_FAIL_DAYS) {
        await this.trackerService.markFailed(
          tracker.trackingCode,
          tracker.ownerId,
        );
        this.logger.log(
          `Tracker ${tracker.trackingCode} (owner: ${tracker.ownerId}) auto-failed after ${daysSinceUpdate} days.`,
        );

        try {
          const owner = await this.client.users.fetch(tracker.ownerId);
          await owner.send(
            `❌ Tracker \`${tracker.trackingCode}\` (${tracker.remark}) has been automatically closed after ${daysSinceUpdate} days without updates.`,
          );
        } catch {
          // Owner DMs closed
        }
        continue;
      }

      if (
        daysSinceUpdate % DeliveryTrackerConstants.STALE_WARNING_DAYS === 0
      ) {
        try {
          const owner = await this.client.users.fetch(tracker.ownerId);
          await owner.send({
            embeds: [this.trackerEmbeds.staleWarningEmbed(tracker)],
          });
        } catch {
          // Owner DMs closed
        }
      }
    }
  }
}
