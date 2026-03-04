import { Injectable, Logger } from '@nestjs/common';
import { ChannelType, MessageFlags } from 'discord.js';
import type { SlashCommandContext, TextCommandContext } from 'necord';
import { Arguments, Context, Options, Subcommand, TextCommand } from 'necord';
import { DeliveryTrackerHelper } from '../delivery-tracker.helper';
import { DeliveryTrackerService } from '../delivery-tracker.service';
import { UntrackDto } from '../dto';
import { DeliveryCommandDecorator } from './decorators';

@Injectable()
@DeliveryCommandDecorator()
export class UntrackCommands {
  private readonly logger = new Logger(UntrackCommands.name);

  constructor(
    private readonly trackerService: DeliveryTrackerService,
    private readonly trackerHelper: DeliveryTrackerHelper,
  ) {}

  @Subcommand({
    name: 'untrack',
    description: 'Stop tracking a delivery code',
  })
  async untrack(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: UntrackDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      // Fetch tracker first for cleanup
      const tracker = await this.trackerService.getTrackerByCodeAndOwner(
        dto.trackingCode,
        interaction.user.id,
      );

      if (!tracker) {
        await interaction.editReply(
          `❌ No tracker found for \`${dto.trackingCode}\` owned by you.`,
        );
        return;
      }

      // Cleanup pending invite messages before deleting
      await this.trackerHelper.cleanupPendingInvites(tracker);

      await this.trackerService.removeTracker(
        dto.trackingCode,
        interaction.user.id,
      );

      await interaction.editReply(
        `✅ Stopped tracking \`${dto.trackingCode}\` (${tracker.remark}).`,
      );
    } catch (error) {
      this.logger.error('Error in /untrack command:', error);
      await interaction.editReply('❌ An error occurred.');
    }
  }

  @TextCommand({
    name: 'untrack',
    description: 'Stop tracking a delivery code',
  })
  async onUntrackText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const isDm = message.channel.type === ChannelType.DM;
    const isGuildText = message.channel.type === ChannelType.GuildText;
    if (!isDm && !isGuildText) return;

    const code = args[0]?.trim();
    if (!code) {
      return message.reply('❌ Usage: `$untrack <tracking_code>`');
    }

    try {
      // Fetch tracker first for cleanup
      const tracker = await this.trackerService.getTrackerByCodeAndOwner(
        code,
        message.author.id,
      );

      if (!tracker) {
        return message.reply(
          `❌ No tracker found for \`${code}\` owned by you.`,
        );
      }

      // Cleanup pending invite messages before deleting
      await this.trackerHelper.cleanupPendingInvites(tracker);

      await this.trackerService.removeTracker(code, message.author.id);

      return message.reply(
        `✅ Stopped tracking \`${code}\` (${tracker.remark}).`,
      );
    } catch (error) {
      this.logger.error('Error in untrack text command:', error);
      return message.reply('❌ An error occurred.');
    }
  }
}
