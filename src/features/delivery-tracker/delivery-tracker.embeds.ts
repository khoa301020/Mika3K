import { Injectable } from '@nestjs/common';
import { Client, EmbedBuilder } from 'discord.js';
import { EMBED_LIMITS, EmbedService } from '../../shared/embed';
import { getTime } from '../../shared/utils';
import { DeliveryTrackerConstants } from './delivery-tracker.constants';
import { ITrackingRecord } from './delivery-tracker.types';
import { DeliveryTrackerDocument } from './schemas/delivery-tracker.schema';

@Injectable()
export class DeliveryTrackerEmbeds {
  constructor(
    private readonly client: Client,
    private readonly embedService: EmbedService,
  ) {}

  trackingUpdateEmbed(
    tracker: DeliveryTrackerDocument,
    record: ITrackingRecord,
  ): EmbedBuilder {
    const color =
      DeliveryTrackerConstants.STATUS_COLORS[tracker.lastKnownStatus] ??
      DeliveryTrackerConstants.DEFAULT_COLOR;
    const dateStr = this.formatTimestamp(record.timestamp);

    const lines = [
      `📦 [\`[${tracker.provider}] ${tracker.trackingCode}\`](<${tracker.trackingUrl}>) - **${tracker.remark}**`,
      '',
    ];
    if (record.code) lines.push(`🧩 **Code**: ${record.code}`);
    lines.push(`📌 **Status**: ${record.status}`);
    lines.push(`📝 **Description**: ${record.description}`);
    lines.push(`🕒 **Date**: ${dateStr}`);
    lines.push(`📍 **Location**: ${this.embedService.safeFieldValue(record.location)}`);

    return this.buildEmbed(color)
      .setAuthor({
        name: this.embedService.truncate(
          `🔔 ${tracker.provider} Update`,
          EMBED_LIMITS.AUTHOR_NAME,
        ),
      })
      .setDescription(`${lines.join('\n')}`);
  }

  trackerListEmbed(
    trackers: DeliveryTrackerDocument[],
    userId: string,
    page = 0,
  ): EmbedBuilder {
    if (!trackers.length) {
      return this.buildEmbed(DeliveryTrackerConstants.COLOR_MUTED)
        .setDescription('📭 You have no active trackers.');
    }

    const pageSize = DeliveryTrackerConstants.TRACK_LIST_PAGE_SIZE;
    const totalPages = Math.ceil(trackers.length / pageSize);
    const start = page * pageSize;
    const pageTrackers = trackers.slice(start, start + pageSize);

    const lines = pageTrackers.map((t) => {
      const emoji =
        DeliveryTrackerConstants.STATUS_EMOJI[t.lastKnownStatus] ?? '📦';
      const ownerMark = t.ownerId === userId ? ' 👑' : '';
      return `${emoji} [\`[${t.provider}] ${t.trackingCode}\`](<${t.trackingUrl}>) — **${t.remark}** - ${t.lastKnownStatus}  ${ownerMark}`;
    });

    const embed = this.buildEmbed(DeliveryTrackerConstants.DEFAULT_COLOR)
      .setTitle('📋 Your Active Trackers')
      .setDescription(lines.join('\n'));

    if (totalPages > 1) {
      embed.setFooter({
        text: `Page ${page + 1}/${totalPages} • ${trackers.length} tracker(s)`,
      });
    }

    return embed;
  }

  trackerInfoEmbed(tracker: DeliveryTrackerDocument, isBroadcast = false): EmbedBuilder {
    const statusEmoji =
      DeliveryTrackerConstants.STATUS_EMOJI[tracker.lastKnownStatus] ?? '📦';
    const color =
      DeliveryTrackerConstants.STATUS_COLORS[tracker.lastKnownStatus] ??
      DeliveryTrackerConstants.DEFAULT_COLOR;

    const recordLimit = isBroadcast
      ? DeliveryTrackerConstants.INITIAL_RECORDS_LIMIT
      : DeliveryTrackerConstants.MAX_HISTORY_RECORDS;
    const recentRecords = tracker.records.slice(0, recordLimit);
    const historyLines = recentRecords.map((r) => {
      const dateStr = this.formatTimestamp(r.timestamp);
      return `\`${dateStr}\` — **${r.status}**\n> ${r.description}${r.location ? ` @ ${r.location}` : ''}`;
    });

    const description = [
      `${statusEmoji} \`[${tracker.provider}] ${tracker.trackingCode}\` — **${tracker.remark}**`,
      `Status: **${tracker.lastKnownStatus}**`,
    ];

    if (!isBroadcast) {
      const broadcastCount = tracker.broadcastTargets.filter(
        (t) => t.status === 'approved',
      ).length;
      description.push(`Broadcast to: **${broadcastCount}** approved target(s)`);
      description.push(
        `Ended: ${tracker.isEnded ? '✅' : '❌'} | Failed: ${tracker.isFailed ? '✅' : '❌'}`,
      );
    }

    description.push('', '**Recent History:**', ...historyLines);

    if (tracker.records.length > recordLimit) {
      description.push(
        `\n... and ${tracker.records.length - recordLimit} more records`,
      );
    }

    return this.buildEmbed(color).setDescription(description.join('\n'));
  }

  watchalongInviteEmbed(
    tracker: DeliveryTrackerDocument,
    inviterTag: string,
  ): EmbedBuilder {
    return this.buildEmbed(DeliveryTrackerConstants.COLOR_WARNING)
      .setTitle('📦 Delivery Tracking Invite')
      .setDescription(
        [
          `**${inviterTag}** wants to share tracking updates with you!`,
          '',
          `📦 Code: \`[${tracker.provider}] ${tracker.trackingCode}\``,
          `📝 Remark: ${tracker.remark}`,
          '',
          'Click **Accept** to receive updates or **Reject** to decline.',
        ].join('\n'),
      );
  }

  staleWarningEmbed(tracker: DeliveryTrackerDocument): EmbedBuilder {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(tracker.lastUpdatedAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return this.buildEmbed(DeliveryTrackerConstants.COLOR_WARNING)
      .setTitle('⚠️ Tracker Stale Warning')
      .setDescription(
        [
          `Your tracker **${tracker.trackingCode}** (${tracker.remark}) hasn't received updates in **${daysSinceUpdate} days**.`,
          '',
          `The tracker will automatically be marked as failed after **${DeliveryTrackerConstants.AUTO_FAIL_DAYS} days** without updates.`,
          '',
          'If you still want to track it, no action is needed — the tracker will continue polling.',
        ].join('\n'),
      );
  }

  trackerCreatedEmbed(
    trackers: Array<{
      tracker: DeliveryTrackerDocument;
      initialRecords: ITrackingRecord[];
    }>,
  ): EmbedBuilder[] {
    return trackers.map(({ tracker, initialRecords }) => {
      const last3 = initialRecords.slice(
        0,
        DeliveryTrackerConstants.INITIAL_RECORDS_LIMIT,
      );
      return this.trackerCreatedWithHistoryEmbed(
        tracker,
        tracker.provider,
        last3,
      );
    });
  }

  trackerCreatedWithHistoryEmbed(
    tracker: DeliveryTrackerDocument,
    provider: string,
    recentRecords: ITrackingRecord[],
  ): EmbedBuilder {
    const lines = [
      `✅ [\`[${provider}] ${tracker.trackingCode}\`](<${tracker.trackingUrl}>) — **${tracker.remark}**`,
    ];

    if (recentRecords.length) {
      lines.push('', '**📋 Last updates:**');
      for (const record of recentRecords) {
        lines.push(
          `> 📌 **${record.status}** — ${record.description}`,
          `> 🕒 ${this.formatTimestamp(record.timestamp)}${record.location ? ` 📍 ${record.location}` : ''}`,
        );
      }
    } else {
      lines.push('', '⏳ No tracking updates yet — will poll automatically.');
    }

    return this.buildEmbed(DeliveryTrackerConstants.COLOR_SUCCESS)
      .setTitle('📦 Tracker Created')
      .setDescription(lines.join('\n'));
  }

  trackEditEmbed(message: string): EmbedBuilder {
    return this.buildEmbed(DeliveryTrackerConstants.DEFAULT_COLOR)
      .setTitle('✏️ Tracker Updated')
      .setDescription(message);
  }

  // ─── Private Utilities ────────────────────────────────────────

  private buildEmbed(color: number): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(color)
      .setTimestamp()
      .setFooter({
        text:
          this.client.user?.displayName ||
          DeliveryTrackerConstants.DEFAULT_BOT_NAME,
        iconURL: this.client.user?.displayAvatarURL(),
      });
  }

  private formatTimestamp(unixSeconds: number): string {
    return getTime(
      new Date(unixSeconds * 1000),
      DeliveryTrackerConstants.TIMEZONE,
      'DD/MM/YYYY HH:mm:ss',
    );
  }
}
