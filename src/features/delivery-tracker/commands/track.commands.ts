import { Injectable, Logger } from '@nestjs/common';
import { ChannelType, Client, MessageFlags, User } from 'discord.js';
import type { ButtonContext, SlashCommandContext, TextCommandContext } from 'necord';
import { Arguments, Button, Context, Options, Subcommand, TextCommand } from 'necord';
import { PaginationPage, PaginationService } from '../../../shared/pagination';
import { DeliveryTrackerConstants } from '../delivery-tracker.constants';
import { DeliveryTrackerEmbeds } from '../delivery-tracker.embeds';
import { DeliveryTrackerHelper } from '../delivery-tracker.helper';
import { DeliveryTrackerService } from '../delivery-tracker.service';
import { DeliveryProvider, DeliveryStatus, IBroadcastTarget, ITrackingRecord } from '../delivery-tracker.types';
import { TrackDto, TrackInfoDto, TrackRefetchDto } from '../dto';
import { DeliveryTrackerDocument } from '../schemas/delivery-tracker.schema';
import { DeliveryCommandDecorator } from './decorators';

@Injectable()
@DeliveryCommandDecorator()
export class TrackCommands {
  private readonly logger = new Logger(TrackCommands.name);

  constructor(
    private readonly trackerService: DeliveryTrackerService,
    private readonly trackerEmbeds: DeliveryTrackerEmbeds,
    private readonly trackerHelper: DeliveryTrackerHelper,
    private readonly paginationService: PaginationService,
    private readonly client: Client,
  ) {}

  // ─── Slash: /delivery track ───────────────────────────────────

  @Subcommand({
    name: 'track',
    description: 'Track a single delivery code',
  })
  async track(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: TrackDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      const code = dto.code.trim();
      const remark = dto.remark.trim();
      const broadcastUser: User | undefined = dto.broadcastTo;
      const isDm = !interaction.guildId;
      const guildId = interaction.guildId || '';

      const provider = this.trackerHelper.detectProvider(code);
      if (!provider) {
        await interaction.editReply(
          `❌ Unknown provider for code \`${code}\`. Supported prefixes: ${this.trackerHelper.supportedPrefixes}`,
        );
        return;
      }

      const broadcastTargets: IBroadcastTarget[] = [
        this.trackerHelper.buildOwnerBroadcastTarget(
          interaction.user.id,
          interaction.channelId,
          guildId,
          isDm,
        ),
      ];

      let result;
      try {
        result = await this.trackerHelper.createTrackerWithInitialFetch(
          code,
          provider,
          remark,
          interaction.user.id,
          broadcastTargets,
        );
      } catch (err: any) {
        await interaction.editReply(`⚠️ ${err.message}`);
        return;
      }

      const last3 = result.initialRecords.slice(
        0,
        DeliveryTrackerConstants.INITIAL_RECORDS_LIMIT,
      );
      
      const content = provider === DeliveryProvider.LEX && !result.tracker.providerMeta?.phone 
        ? '💡 **Tip:** Add the last 4 digits of the receiver\'s phone number after the code to securely see delivery photos! (e.g. `LEXST...VN 1234`)' 
        : undefined;

      await interaction.editReply({
        content,
        embeds: [
          this.trackerEmbeds.trackerCreatedWithHistoryEmbed(
            result.tracker,
            provider,
            last3,
          ),
        ],
      });

      if (broadcastUser && broadcastUser.id !== interaction.user.id) {
        await this.trackerHelper.sendWatchalongInvites(
          [result.tracker],
          broadcastUser.id,
          interaction.user,
          guildId,
        );
      }
    } catch (error) {
      this.logger.error('Error in /track command:', error);
      await interaction.editReply(
        '❌ An error occurred while creating the tracker.',
      );
    }
  }

  // ─── Text: $track ─────────────────────────────────────────────

  @TextCommand({
    name: DeliveryTrackerConstants.COMMAND_PREFIX_TRACK,
    description: 'Track delivery packages',
  })
  async onTrackText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const isDm = message.channel.type === ChannelType.DM;
    const isGuildText = message.channel.type === ChannelType.GuildText;
    if (!isDm && !isGuildText) return;

    try {
      const content = args.join(' ').trim();
      if (!content) {
        const prefix = process.env.BOT_PREFIX || '$';
        return message.reply(
          `❌ Usage: \`${prefix}track [@user1] [userID2] <CODE> <remark>; <CODE2> <remark2>\``,
        );
      }

      // Split by semicolons for multi-code tracking
      const segments = content.split(';').map((s) => s.trim()).filter(Boolean);
      const guildId = message.guildId || '';

      const createdResults: Array<{
        tracker: DeliveryTrackerDocument;
        initialRecords: ITrackingRecord[];
      }> = [];

      // Collect all user IDs from first segment (they apply to all codes)
      const firstParsed = this.trackerHelper.parseTrackArgs(
        segments[0].split(/\s+/),
      );
      const broadcastUserIds = firstParsed.userIds;

      for (const segment of segments) {
        const parsed = this.trackerHelper.parseTrackArgs(
          segment.split(/\s+/),
        );

        // Use userIds from first segment if this segment has none
        const code = parsed.trackingCode;
        if (!code) {
          await message.reply(`⚠️ No tracking code found in: \`${segment}\``);
          continue;
        }

        const provider = this.trackerHelper.detectProvider(code);
        if (!provider) {
          await message.reply(
            `⚠️ Unknown provider for code \`${code}\`. Supported: ${this.trackerHelper.supportedPrefixes}`,
          );
          continue;
        }

        const broadcastTargets: IBroadcastTarget[] = [
          this.trackerHelper.buildOwnerBroadcastTarget(
            message.author.id,
            message.channelId,
            guildId,
            isDm,
          ),
        ];

        try {
          const result =
            await this.trackerHelper.createTrackerWithInitialFetch(
              code,
              provider,
              parsed.remark,
              message.author.id,
              broadcastTargets,
            );
          createdResults.push(result);
        } catch (err: any) {
          await message.reply(`⚠️ ${err.message}`);
        }
      }

      if (createdResults.length) {
        const embeds =
          this.trackerEmbeds.trackerCreatedEmbed(createdResults);
          
        const hasLexWithoutPhone = createdResults.some((r) => r.tracker.provider === DeliveryProvider.LEX && !r.tracker.providerMeta?.phone);
        const content = hasLexWithoutPhone
          ? '💡 **Tip:** You tracked a LEX package. Add the last 4 digits of the receiver\'s phone number to see the final delivery photo! (e.g. `$track LEXST...VN 1234`)'
          : undefined;

        await message.reply({ content, embeds });

        // Send watchalong invites for all mentioned users across all created trackers
        if (broadcastUserIds.length) {
          const trackers = createdResults.map((r) => r.tracker);
          for (const userId of broadcastUserIds) {
            if (userId === message.author.id) continue;
            await this.trackerHelper.sendWatchalongInvites(
              trackers,
              userId,
              message.author,
              guildId,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in track text command:', error);
      await message.reply('❌ An error occurred while creating trackers.');
    }
  }

  // ─── Text: $refetch ───────────────────────────────────────────

  @TextCommand({
    name: 'refetch',
    description: 'Force an update check for tracked delivery codes',
  })
  async onRefetchText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const isDm = message.channel.type === ChannelType.DM;
    const isGuildText = message.channel.type === ChannelType.GuildText;
    if (!isDm && !isGuildText) return;

    try {
      const content = args.join(' ').trim();
      if (!content) {
        const prefix = process.env.BOT_PREFIX || '$';
        return message.reply(`❌ Usage: \`${prefix}refetch <CODE1> <CODE2>...\``);
      }

      const codes = content.split(/[\s,;]+/).filter(Boolean);
      const results: string[] = [];

      for (const code of codes) {
        const tracker = await this.trackerService.getVisibleTrackerByCode(
          code.trim(),
          message.author.id,
        );

        if (!tracker) {
          results.push(`❌ \`${code}\`: Not found or not visible to you.`);
          continue;
        }

        const fetchedRecords = await this.trackerHelper.fetchRecords(
          tracker.trackingCode,
          tracker.provider,
          tracker.providerMeta,
        );

        const newRecords = this.trackerHelper.diffRecords(tracker.records, fetchedRecords);

        if (newRecords.length > 0) {
          const status = this.trackerHelper.resolveStatus(tracker.provider, fetchedRecords);
          const savedTracker = await this.trackerService.appendRecords(
            tracker.trackingCode,
            tracker.ownerId,
            newRecords,
            status,
          );

          if (savedTracker) {
            if (DeliveryTrackerConstants.TERMINAL_STATUSES.includes(status)) {
              const isFailed = status === DeliveryStatus.FAILED || status === DeliveryStatus.CANCELLED;
              await this.trackerService.markEnded(tracker.trackingCode, tracker.ownerId, isFailed);
            }
          }
          results.push(`✅ \`${tracker.trackingCode}\`: Fetched **${newRecords.length}** new update(s).`);
        } else {
          await this.trackerService.touchPolled(tracker.trackingCode, tracker.ownerId);
          results.push(`ℹ️ \`${tracker.trackingCode}\`: No new updates.`);
        }
      }

      await message.reply(results.join('\n'));
    } catch (error) {
      this.logger.error('Error in refetch text command:', error);
      await message.reply('❌ An error occurred while refetching.');
    }
  }

  // ─── Slash: /delivery track-list ──────────────────────────────

  @Subcommand({
    name: 'track-list',
    description: 'List your active delivery trackers',
  })
  async trackList(@Context() [interaction]: SlashCommandContext) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      const trackers = await this.trackerService.getVisibleTrackers(
        interaction.user.id,
      );

      if (!trackers.length) {
        await interaction.editReply({
          embeds: [this.trackerEmbeds.trackerListEmbed(trackers, interaction.user.id)],
        });
        return;
      }

      const pageSize = DeliveryTrackerConstants.TRACK_LIST_PAGE_SIZE;
      const totalPages = Math.ceil(trackers.length / pageSize);
      const pages: PaginationPage[] = [];

      for (let i = 0; i < totalPages; i++) {
        pages.push({
          embeds: [
            this.trackerEmbeds.trackerListEmbed(
              trackers,
              interaction.user.id,
              i,
            ),
          ],
        });
      }

      await this.paginationService.paginate(interaction, pages, {
        ephemeral: true,
        showStartEnd: false,
      });
    } catch (error) {
      this.logger.error('Error in /track-list command:', error);
      await interaction.editReply('❌ An error occurred.');
    }
  }

  // ─── Slash: /delivery track-info ──────────────────────────────

  @Subcommand({
    name: 'track-info',
    description: 'View full tracking history for a code (tracked or untracked)',
  })
  async trackInfo(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: TrackInfoDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      const code = dto.trackingCode.trim();

      // First try to find a stored tracker
      const tracker = await this.trackerService.getVisibleTrackerByCode(
        code,
        interaction.user.id,
      );

      if (tracker) {
        const isBroadcast = tracker.ownerId !== interaction.user.id;
        await interaction.editReply({
          embeds: [this.trackerEmbeds.trackerInfoEmbed(tracker, isBroadcast)],
        });
        return;
      }

      // If not stored, try to detect provider and fetch directly
      const provider = this.trackerHelper.detectProvider(code);
      if (!provider) {
        await interaction.editReply(
          `❌ No tracker found for \`${code}\` and unable to detect provider. Supported prefixes: ${this.trackerHelper.supportedPrefixes}`,
        );
        return;
      }

      // Fetch from provider
      const records = await this.trackerHelper.fetchRecords(code, provider);
      
      if (!records.length) {
        await interaction.editReply(
          `❌ No tracker found & no history could be dynamically fetched for \`${code}\` via ${provider}.`,
        );
        return;
      }

      const status = this.trackerHelper.resolveStatus(provider, records);
      const isFailed = status === DeliveryStatus.FAILED || status === DeliveryStatus.CANCELLED;

      // Create a temporary/in-memory tracker document representation
      const tempTracker = {
        trackingCode: code,
        aliasCodes: [],
        trackingUrl: '', // Could be fetched but not strictly needed for embed if simple
        provider,
        remark: 'Untracked',
        ownerId: interaction.user.id,
        broadcastTargets: [],
        records: records.sort((a, b) => b.timestamp - a.timestamp),
        lastKnownStatus: status,
        lastPolledAt: new Date(),
        lastUpdatedAt: new Date(),
        isEnded: DeliveryTrackerConstants.TERMINAL_STATUSES.includes(status),
        isFailed,
        providerMeta: {}, // no simple way to pass phone number here dynamically unless we add it to DTO
      } as unknown as DeliveryTrackerDocument;

      const providerImpl = this.trackerHelper.getProvider(provider);
      if (providerImpl) {
          tempTracker.trackingUrl = providerImpl.getTrackingUrl(code);
      }

      await interaction.editReply({
        content: `💡 **Tip**: This code is currently **untracked**. Use \`/delivery track\` to get automatic notifications!`,
        embeds: [this.trackerEmbeds.trackerInfoEmbed(tempTracker, false)],
      });
    } catch (error) {
      this.logger.error('Error in /track-info command:', error);
      await interaction.editReply('❌ An error occurred.');
    }
  }

  // ─── Slash: /delivery track-refetch ───────────────────────────

  @Subcommand({
    name: 'track-refetch',
    description: 'Force an update check for a tracked delivery code',
  })
  async trackRefetch(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: TrackRefetchDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      const code = dto.trackingCode.trim();

      const tracker = await this.trackerService.getVisibleTrackerByCode(
        code,
        interaction.user.id,
      );

      if (!tracker) {
        await interaction.editReply(
          `❌ No tracker found for \`${code}\` visible to you.`,
        );
        return;
      }

      const fetchedRecords = await this.trackerHelper.fetchRecords(
        tracker.trackingCode,
        tracker.provider,
        tracker.providerMeta,
      );

      const newRecords = this.trackerHelper.diffRecords(tracker.records, fetchedRecords);
      let updatedTracker = tracker;

      if (newRecords.length > 0) {
        const status = this.trackerHelper.resolveStatus(tracker.provider, fetchedRecords);
        const savedTracker = await this.trackerService.appendRecords(
          tracker.trackingCode,
          tracker.ownerId,
          newRecords,
          status,
        );

        if (savedTracker) {
          updatedTracker = savedTracker;

          if (DeliveryTrackerConstants.TERMINAL_STATUSES.includes(status)) {
            const isFailed = status === DeliveryStatus.FAILED || status === DeliveryStatus.CANCELLED;
            await this.trackerService.markEnded(tracker.trackingCode, tracker.ownerId, isFailed);
            updatedTracker.isEnded = true;
            updatedTracker.isFailed = isFailed;
          }
        }
        await interaction.editReply({
          content: `✅ Successfully fetched **${newRecords.length}** new update(s) for \`${tracker.trackingCode}\`.`,
          embeds: [this.trackerEmbeds.trackerInfoEmbed(updatedTracker, updatedTracker.ownerId !== interaction.user.id)],
        });
      } else {
        // Just touch the polled time
        await this.trackerService.touchPolled(tracker.trackingCode, tracker.ownerId);
        await interaction.editReply({
          content: `ℹ️ No new updates found for \`${tracker.trackingCode}\`.`,
          embeds: [this.trackerEmbeds.trackerInfoEmbed(tracker, tracker.ownerId !== interaction.user.id)],
        });
      }
    } catch (error) {
      this.logger.error('Error in /track-refetch command:', error);
      await interaction.editReply('❌ An error occurred while refetching.');
    }
  }

  // ─── Button: Accept Watchalong ────────────────────────────────

  @Button('track_accept/:code/:ownerId')
  async onAcceptWatchalong(@Context() [interaction]: ButtonContext) {
    const parsed = this.trackerHelper.parseButtonCustomId(
      interaction.customId,
    );

    if (!parsed) {
      await interaction.reply({
        content: '❌ Invalid button data.',
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    try {
      await this.trackerService.approveBroadcastTarget(
        parsed.code,
        parsed.ownerId,
        interaction.user.id,
      );

      await interaction.update({
        content:
          '✅ You have accepted the tracking invite! You will receive updates.',
        components: [],
      });

      // Send current history to the newly approved user
      const tracker = await this.trackerService.getTrackerByCodeAndOwner(
        parsed.code,
        parsed.ownerId,
      );
      if (tracker && tracker.records.length) {
        try {
          await interaction.user.send({
            embeds: [this.trackerEmbeds.trackerInfoEmbed(tracker, true)],
          });
        } catch {
          // User DMs might be restricted
        }
      }

      try {
        const owner = await this.client.users.fetch(parsed.ownerId);
        const remarkText = tracker ? ` (${tracker.remark})` : '';
        await owner.send(
          `✅ **${interaction.user.tag}** accepted the watchalong for \`[${tracker?.provider || 'Unknown'}] ${parsed.code}\`${remarkText}.`,
        );
      } catch {
        // Owner DM closed
      }
    } catch (error) {
      this.logger.error('Error accepting watchalong:', error);
      await interaction.reply({
        content: '❌ An error occurred.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

  // ─── Button: Reject Watchalong ────────────────────────────────

  @Button('track_reject/:code/:ownerId')
  async onRejectWatchalong(@Context() [interaction]: ButtonContext) {
    const parsed = this.trackerHelper.parseButtonCustomId(
      interaction.customId,
    );

    if (!parsed) {
      await interaction.reply({
        content: '❌ Invalid button data.',
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    try {
      // Remove rejected user from broadcast targets (not stored)
      const tracker = await this.trackerService.removeBroadcastTarget(
        parsed.code,
        parsed.ownerId,
        interaction.user.id,
      );

      await interaction.update({
        content: '❌ You have declined the tracking invite.',
        components: [],
      });

      // Notify the owner about the rejection
      try {
        const owner = await this.client.users.fetch(parsed.ownerId);
        const remarkText = tracker ? ` (${tracker.remark})` : '';
        const providerName = tracker ? tracker.provider : 'Unknown';
        await owner.send(
          `❌ **${interaction.user.tag}** declined the watchalong for \`[${providerName}] ${parsed.code}\`${remarkText}.`,
        );
      } catch {
        // Owner DM closed
      }
    } catch (error) {
      this.logger.error('Error rejecting watchalong:', error);
      await interaction.reply({
        content: '❌ An error occurred.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  }
}
