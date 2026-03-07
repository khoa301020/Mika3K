import { Injectable, Logger } from '@nestjs/common';
import { ChannelType, MessageFlags } from 'discord.js';
import type { SlashCommandContext, TextCommandContext } from 'necord';
import { Arguments, Context, Options, Subcommand, TextCommand } from 'necord';
import { DeliveryTrackerEmbeds } from '../delivery-tracker.embeds';
import { DeliveryTrackerHelper } from '../delivery-tracker.helper';
import { DeliveryTrackerService } from '../delivery-tracker.service';
import { TrackEditAction, TrackEditDto } from '../dto';
import { DeliveryCommandDecorator } from './decorators';

@Injectable()
@DeliveryCommandDecorator()
export class TrackEditCommands {
  private readonly logger = new Logger(TrackEditCommands.name);

  constructor(
    private readonly trackerService: DeliveryTrackerService,
    private readonly trackerEmbeds: DeliveryTrackerEmbeds,
    private readonly trackerHelper: DeliveryTrackerHelper,
  ) {}

  // ─── Slash: /delivery track-edit ──────────────────────────────

  @Subcommand({
    name: 'track-edit',
    description: 'Edit an active tracker (add/remove broadcast, change remark)',
  })
  async trackEdit(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: TrackEditDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      const code = dto.code.trim();
      const ownerId = interaction.user.id;

      // Verify ownership
      const tracker = await this.trackerService.getTrackerByCodeAndOwner(
        code,
        ownerId,
      );

      if (!tracker) {
        await interaction.editReply(
          `❌ No tracker found for \`${code}\` owned by you.`,
        );
        return;
      }

      if (tracker.isEnded || tracker.isFailed) {
        await interaction.editReply(
          '❌ This tracker has already ended. Cannot modify.',
        );
        return;
      }

      switch (dto.action) {
        case TrackEditAction.ADD: {
          let targetUserId = dto.user?.id;
          if (!targetUserId && dto.value && /^\d{17,19}$/.test(dto.value.trim())) {
             targetUserId = dto.value.trim();
          }
          
          if (!targetUserId) {
            await interaction.editReply('❌ Please specify a user to add (select `user` option or provide UserID in `value`).');
            return;
          }

          const userTag = dto.user?.tag || `<@${targetUserId}>`;

          await this.trackerHelper.sendWatchalongInvites(
            [tracker as any],
            targetUserId,
            interaction.user,
            interaction.guildId || '',
          );

          await interaction.editReply({
            embeds: [
              this.trackerEmbeds.trackEditEmbed(
                `📩 Sent watchalong invite to **${userTag}** for \`${code}\`.`,
              ),
            ],
          });
          break;
        }

        case TrackEditAction.REMOVE: {
          let targetUserId = dto.user?.id;
          if (!targetUserId && dto.value && /^\d{17,19}$/.test(dto.value.trim())) {
             targetUserId = dto.value.trim();
          }

          if (!targetUserId) {
            await interaction.editReply(
              '❌ Please specify a user to remove (select `user` option or provide UserID in `value`).',
            );
            return;
          }

          if (targetUserId === ownerId) {
            await interaction.editReply(
              '❌ Cannot remove the owner. Use `/delivery untrack` instead.',
            );
            return;
          }

          await this.trackerService.removeBroadcastTarget(
            code,
            ownerId,
            targetUserId,
          );

          const userTag = dto.user?.tag || `<@${targetUserId}>`;

          await interaction.editReply({
            embeds: [
              this.trackerEmbeds.trackEditEmbed(
                `🗑️ Removed **${userTag}** from broadcast list for \`${code}\`.`,
              ),
            ],
          });
          break;
        }

        case TrackEditAction.ADD_CHANNEL: {
          const { error } = await this.trackerService.addBroadcastTarget(
            code,
            ownerId,
            {
              userId: ownerId,
              channelId: interaction.channelId,
              guildId: interaction.guildId || undefined,
              type: 'channel',
              status: 'approved',
            },
          );

          if (error) {
            await interaction.editReply(`⚠️ ${error}`);
            return;
          }

          await interaction.editReply({
            embeds: [
              this.trackerEmbeds.trackEditEmbed(
                `📢 Added <#${interaction.channelId}> as a broadcast channel for \`${code}\`.`,
              ),
            ],
          });
          break;
        }

        case TrackEditAction.REMARK: {
          const newRemark = dto.value?.trim();
          if (!newRemark) {
            await interaction.editReply(
              '❌ Please specify the new remark in the `value` field.',
            );
            return;
          }

          await this.trackerService.updateRemark(code, ownerId, newRemark);

          await interaction.editReply({
            embeds: [
              this.trackerEmbeds.trackEditEmbed(
                `📝 Updated remark for \`${code}\` to: **${newRemark}**`,
              ),
            ],
          });
          break;
        }

        case TrackEditAction.ADD_PHONE: {
          const phone = dto.value?.trim();
          if (!phone || !/^\d{4}$/.test(phone)) {
            await interaction.editReply('❌ Please provide the 4-digit phone number in the `value` field.');
            return;
          }

          const newMeta = { ...(tracker.providerMeta || {}), phone };
          await this.trackerService.updateProviderMeta(code, ownerId, newMeta);

          await interaction.editReply({
            embeds: [
              this.trackerEmbeds.trackEditEmbed(
                `📞 Successfully linked phone number \`${phone}\` to \`${code}\`. You will now receive delivery proof photos.`,
              ),
            ],
          });
          break;
        }

        default:
          await interaction.editReply('❌ Unknown action.');
      }
    } catch (error) {
      this.logger.error('Error in /track-edit command:', error);
      await interaction.editReply('❌ An error occurred.');
    }
  }

  // ─── Text: $track-edit ────────────────────────────────────────

  @TextCommand({
    name: 'track-edit',
    description: 'Edit an active tracker',
  })
  async onTrackEditText(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    const isDm = message.channel.type === ChannelType.DM;
    const isGuildText = message.channel.type === ChannelType.GuildText;
    if (!isDm && !isGuildText) return;

    try {
      if (args.length < 2) {
        const prefix = process.env.BOT_PREFIX || '$';
        return message.reply(
          [
            '❌ Usage:',
            `\`${prefix}track-edit <CODE> add <@user1> [userID2]\``,
            `\`${prefix}track-edit <CODE> add-channel\``,
            `\`${prefix}track-edit <CODE> remove <@user1/userID>\``,
            `\`${prefix}track-edit <CODE> remark <new text>\``,
            `\`${prefix}track-edit <CODE> add-phone <4-digit-phone>\``,
          ].join('\n'),
        );
      }

      const code = args[0].trim();
      const action = args[1].toLowerCase().trim();
      const ownerId = message.author.id;

      const tracker = await this.trackerService.getTrackerByCodeAndOwner(
        code,
        ownerId,
      );

      if (!tracker) {
        return message.reply(
          `❌ No tracker found for \`${code}\` owned by you.`,
        );
      }

      if (tracker.isEnded || tracker.isFailed) {
        return message.reply(
          '❌ This tracker has already ended. Cannot modify.',
        );
      }

      const guildId = message.guildId || '';

      switch (action) {
        case TrackEditAction.ADD: {
          const userTokens = args.slice(2);
          if (!userTokens.length) {
            return message.reply(
              '❌ Please specify users to add (mentions or user IDs).',
            );
          }

          const parsed = this.trackerHelper.parseTrackArgs(userTokens);
          if (!parsed.userIds.length) {
            return message.reply('❌ No valid user IDs found.');
          }

          for (const userId of parsed.userIds) {
            if (userId === ownerId) continue;
            await this.trackerHelper.sendWatchalongInvites(
              [tracker as any],
              userId,
              message.author,
              guildId,
            );
          }

          return message.reply({
            embeds: [
              this.trackerEmbeds.trackEditEmbed(
                `📩 Sent watchalong invites for \`${code}\` to ${parsed.userIds.length} user(s).`,
              ),
            ],
          });
        }

        case TrackEditAction.ADD_CHANNEL: {
          const { error } = await this.trackerService.addBroadcastTarget(
            code,
            ownerId,
            {
              userId: ownerId,
              channelId: message.channelId,
              guildId: guildId || undefined,
              type: 'channel',
              status: 'approved',
            },
          );

          if (error) {
            return message.reply(`⚠️ ${error}`);
          }

          return message.reply({
            embeds: [
              this.trackerEmbeds.trackEditEmbed(
                `📢 Added <#${message.channelId}> as a broadcast channel for \`${code}\`.`,
              ),
            ],
          });
        }

        case TrackEditAction.REMOVE: {
          const userTokens = args.slice(2);
          if (!userTokens.length) {
            return message.reply(
              '❌ Please specify a user to remove (mention or user ID).',
            );
          }

          const parsed = this.trackerHelper.parseTrackArgs(userTokens);
          if (!parsed.userIds.length) {
            return message.reply('❌ No valid user IDs found.');
          }

          for (const userId of parsed.userIds) {
            if (userId === ownerId) {
              await message.reply(
                '❌ Cannot remove the owner. Use `$untrack` instead.',
              );
              continue;
            }
            await this.trackerService.removeBroadcastTarget(
              code,
              ownerId,
              userId,
            );
          }

          return message.reply({
            embeds: [
              this.trackerEmbeds.trackEditEmbed(
                `🗑️ Removed ${parsed.userIds.length} user(s) from broadcast list for \`${code}\`.`,
              ),
            ],
          });
        }

        case TrackEditAction.REMARK: {
          const newRemark = args.slice(2).join(' ').trim();
          if (!newRemark) {
            return message.reply('❌ Please specify the new remark text.');
          }

          await this.trackerService.updateRemark(code, ownerId, newRemark);

          return message.reply({
            embeds: [
              this.trackerEmbeds.trackEditEmbed(
                `📝 Updated remark for \`${code}\` to: **${newRemark}**`,
              ),
            ],
          });
        }

        case TrackEditAction.ADD_PHONE: {
          const phone = args[2]?.trim();
          if (!phone || !/^\d{4}$/.test(phone)) {
            return message.reply('❌ Please provide a valid 4-digit phone number (e.g. `$track-edit CODE add-phone 1234`).');
          }

          const newMeta = { ...(tracker.providerMeta || {}), phone };
          await this.trackerService.updateProviderMeta(code, ownerId, newMeta);

          return message.reply({
            embeds: [
              this.trackerEmbeds.trackEditEmbed(
                `📞 Successfully linked phone number \`${phone}\` to \`${code}\`. You will now receive delivery proof photos.`,
              ),
            ],
          });
        }

        default:
          return message.reply(
            `❌ Unknown action \`${action}\`. Use: add, remove, add-channel, remark.`,
          );
      }
    } catch (error) {
      this.logger.error('Error in track-edit text command:', error);
      return message.reply('❌ An error occurred.');
    }
  }
}
