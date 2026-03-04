import { Injectable, Logger } from '@nestjs/common';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    MessageActionRowComponentBuilder,
    User,
} from 'discord.js';
import { DeliveryTrackerConstants } from './delivery-tracker.constants';
import { DeliveryTrackerEmbeds } from './delivery-tracker.embeds';
import { DeliveryTrackerService } from './delivery-tracker.service';
import {
    DeliveryProvider,
    DeliveryStatus,
    IBroadcastTarget,
    ITrackingRecord,
} from './delivery-tracker.types';
import { JntProvider } from './providers/jnt.provider';
import { SpxProvider } from './providers/spx.provider';
import { ITrackerProvider } from './providers/tracker-provider.interface';
import { DeliveryTrackerDocument } from './schemas/delivery-tracker.schema';

const MENTION_REGEX = /^<@!?(\d{17,19})>$/;
const RAW_ID_REGEX = /^\d{17,19}$/;

@Injectable()
export class DeliveryTrackerHelper {
  private readonly logger = new Logger(DeliveryTrackerHelper.name);
  private readonly providers: ITrackerProvider[];

  constructor(
    private readonly trackerService: DeliveryTrackerService,
    private readonly trackerEmbeds: DeliveryTrackerEmbeds,
    private readonly client: Client,
    private readonly spxProvider: SpxProvider,
    private readonly jntProvider: JntProvider,
  ) {
    this.providers = [this.spxProvider, this.jntProvider];
  }

  // ─── Provider Utilities ───────────────────────────────────────

  getAllProviders(): ITrackerProvider[] {
    return this.providers;
  }

  getProvider(provider: DeliveryProvider): ITrackerProvider | undefined {
    return this.providers.find((p) => p.providerName === provider);
  }

  detectProvider(code: string): DeliveryProvider | null {
    const upper = code.toUpperCase();
    for (const provider of this.providers) {
      if (provider.codePrefixes.some((prefix) => upper.startsWith(prefix))) {
        return provider.providerName;
      }
    }
    return null;
  }

  get supportedPrefixes(): string {
    return this.providers.flatMap((p) => p.codePrefixes).join(', ');
  }

  // ─── Parsing ──────────────────────────────────────────────────

  /**
   * Parse tokens into { userIds, trackingCode, remark }.
   * Order: mentions/rawIDs first → first letter-prefixed token is the code → rest is remark.
   */
  parseTrackArgs(tokens: string[]): {
    userIds: string[];
    trackingCode: string | null;
    remark: string;
  } {
    const userIds: string[] = [];
    let trackingCode: string | null = null;
    const remarkParts: string[] = [];

    for (const token of tokens) {
      // Already found the code — rest is remark
      if (trackingCode) {
        remarkParts.push(token);
        continue;
      }

      // Mention: <@123...> or <@!123...>
      const mentionMatch = token.match(MENTION_REGEX);
      if (mentionMatch) {
        userIds.push(mentionMatch[1]);
        continue;
      }

      // Raw user ID: 17-19 digits
      if (RAW_ID_REGEX.test(token)) {
        userIds.push(token);
        continue;
      }

      // Must be the tracking code (letter-prefixed)
      trackingCode = token;
    }

    return {
      userIds,
      trackingCode,
      remark: remarkParts.join(' ') || trackingCode || '',
    };
  }

  // ─── Fetch & Records ─────────────────────────────────────────

  async fetchRecords(
    code: string,
    provider: DeliveryProvider,
    meta?: Record<string, any>,
  ): Promise<ITrackingRecord[]> {
    const providerImpl = this.getProvider(provider);
    if (!providerImpl) return [];

    try {
      return await providerImpl.fetchTracking(code, meta);
    } catch (err) {
      this.logger.warn(`Could not fetch records for ${code}: ${err}`);
      return [];
    }
  }

  resolveStatus(
    provider: DeliveryProvider,
    records: ITrackingRecord[],
  ): DeliveryStatus {
    const providerImpl = this.getProvider(provider);
    return providerImpl
      ? providerImpl.resolveStatus(records)
      : DeliveryStatus.PENDING;
  }

  /** Diff fetched records against stored records by timestamp */
  diffRecords(
    stored: ITrackingRecord[],
    fetched: ITrackingRecord[],
  ): ITrackingRecord[] {
    if (!stored.length) return fetched;

    // stored is sorted newest-first; latest timestamp is stored[0]
    const latestStoredTimestamp = stored[0].timestamp;
    return fetched.filter((r) => r.timestamp > latestStoredTimestamp);
  }

  // ─── Create Flow ──────────────────────────────────────────────

  async createTrackerWithInitialFetch(
    code: string,
    provider: DeliveryProvider,
    remark: string,
    ownerId: string,
    broadcastTargets: IBroadcastTarget[],
  ): Promise<{
    tracker: DeliveryTrackerDocument;
    initialRecords: ITrackingRecord[];
  }> {
    const tracker = await this.trackerService.createTracker(
      code,
      provider,
      remark,
      ownerId,
      broadcastTargets,
    );

    const initialRecords = await this.fetchRecords(code, provider);

    if (initialRecords.length) {
      const status = this.resolveStatus(provider, initialRecords);
      await this.trackerService.appendRecords(
        code,
        ownerId,
        initialRecords,
        status,
      );

      if (DeliveryTrackerConstants.TERMINAL_STATUSES.includes(status)) {
        await this.trackerService.markEnded(code, ownerId);
      }
    }

    return { tracker, initialRecords };
  }

  // ─── Broadcast Targets ────────────────────────────────────────

  buildOwnerBroadcastTarget(
    userId: string,
    channelId: string,
    guildId: string,
    isDm: boolean,
  ): IBroadcastTarget {
    return {
      userId,
      channelId: isDm ? undefined : channelId,
      guildId: isDm ? undefined : guildId,
      type: isDm ? 'dm' : 'channel',
      status: 'approved',
    };
  }

  /** Build button customId: track_accept/<code>/<ownerId> */
  buildButtonCustomId(action: string, code: string, ownerId: string): string {
    return `${action}/${code}/${ownerId}`;
  }

  /** Parse button customId → { code, ownerId } */
  parseButtonCustomId(customId: string): { code: string; ownerId: string } | null {
    const parts = customId.split('/');
    if (parts.length < 3) return null;
    return { code: parts[1], ownerId: parts[2] };
  }

  buildWatchalongActionRow(
    code: string,
    ownerId: string,
  ): ActionRowBuilder<MessageActionRowComponentBuilder> {
    const acceptBtn = new ButtonBuilder()
      .setLabel(DeliveryTrackerConstants.LABEL_ACCEPT)
      .setStyle(ButtonStyle.Success)
      .setCustomId(
        this.buildButtonCustomId(
          DeliveryTrackerConstants.BUTTON_ACCEPT,
          code,
          ownerId,
        ),
      );

    const rejectBtn = new ButtonBuilder()
      .setLabel(DeliveryTrackerConstants.LABEL_REJECT)
      .setStyle(ButtonStyle.Danger)
      .setCustomId(
        this.buildButtonCustomId(
          DeliveryTrackerConstants.BUTTON_REJECT,
          code,
          ownerId,
        ),
      );

    return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      acceptBtn,
      rejectBtn,
    );
  }

  /** Send watchalong DM invites, validating mutual guild membership */
  async sendWatchalongInvites(
    trackers: DeliveryTrackerDocument[],
    targetUserId: string,
    inviter: User,
    guildId: string,
  ): Promise<void> {
    // Validate target user exists
    let targetUser: User;
    try {
      targetUser = await this.client.users.fetch(targetUserId);
    } catch {
      this.logger.warn(`Could not fetch user ${targetUserId}`);
      return;
    }

    // Verify mutual guild membership
    if (guildId) {
      try {
        const guild = await this.client.guilds.fetch(guildId);
        const member = await guild.members
          .fetch(targetUserId)
          .catch(() => null);
        if (!member) {
          this.logger.warn(
            `User ${targetUser.tag} not in guild ${guildId}, skipping watchalong`,
          );
          return;
        }
      } catch {
        return;
      }
    }

    for (const tracker of trackers) {
      const { error } = await this.trackerService.addBroadcastTarget(
        tracker.trackingCode,
        tracker.ownerId,
        {
          userId: targetUserId,
          type: 'dm',
          status: 'pending',
        },
      );

      if (error) {
        try {
          await inviter.send(
            `⚠️ ${error} (code: \`${tracker.trackingCode}\`, user: ${targetUser.tag})`,
          );
        } catch {
          // Inviter DMs closed
        }
        continue;
      }

      const row = this.buildWatchalongActionRow(
        tracker.trackingCode,
        tracker.ownerId,
      );

      try {
        const sentMsg = await targetUser.send({
          embeds: [
            this.trackerEmbeds.watchalongInviteEmbed(tracker, inviter.tag),
          ],
          components: [row],
        });

        // Store the invite message ID for cleanup on untrack
        await this.trackerService.updateInviteMessageId(
          tracker.trackingCode,
          tracker.ownerId,
          targetUserId,
          sentMsg.id,
          sentMsg.channelId,
        );
      } catch {
        this.logger.warn(`Could not DM ${targetUser.tag} — DMs closed`);
        // Remove the pending target since we can't reach them
        await this.trackerService.removeBroadcastTarget(
          tracker.trackingCode,
          tracker.ownerId,
          targetUserId,
        );
        try {
          await inviter.send(
            `⚠️ Could not send watchalong invite to **${targetUser.tag}** for \`${tracker.trackingCode}\` — their DMs are closed.`,
          );
        } catch {
          // Inviter DMs also closed
        }
      }
    }
  }

  /** Cleanup on untrack: disable pending invite buttons + notify approved broadcast users */
  async cleanupPendingInvites(
    tracker: DeliveryTrackerDocument,
  ): Promise<void> {
    for (const target of tracker.broadcastTargets) {
      // Skip the owner — they're the one untracking
      if (target.userId === tracker.ownerId && target.type !== 'channel') continue;

      try {
        if (target.status === 'pending' && target.inviteMessageId) {
          // Disable stale invite buttons
          const user = await this.client.users.fetch(target.userId);
          const dmChannel = await user.createDM();
          const msg = await dmChannel.messages.fetch(target.inviteMessageId);
          await msg.edit({
            content: '⚠️ This tracking invite has been cancelled by the sender.',
            embeds: [],
            components: [],
          });
        } else if (target.status === 'approved') {
          // Notify approved users that tracking was cancelled
          if (target.type === 'dm') {
            const user = await this.client.users.fetch(target.userId);
            await user.send(
              `📦 Tracking for \`${tracker.trackingCode}\` (${tracker.remark}) has been **stopped** by the sender.`,
            );
          } else if (target.type === 'channel' && target.channelId) {
            const channel = await this.client.channels.fetch(target.channelId);
            if (channel && 'send' in channel) {
              await (channel as any).send(
                `📦 Tracking for \`${tracker.trackingCode}\` (${tracker.remark}) has been **stopped** by the owner.`,
              );
            }
          }
        }
      } catch {
        this.logger.debug(
          `Could not clean up for broadcast target ${target.userId}`,
        );
      }
    }
  }
}
