import { HoyolabCommandDecorator } from './decorators';
import { Injectable, Logger } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import type { SlashCommandContext } from 'necord';
import { Context, Options, Subcommand } from 'necord';
import { HoyolabRedeemDto } from '../dto/hoyolab.dto';
import { HoyolabEmbeds } from '../hoyolab.embeds';
import { HoyolabService } from '../hoyolab.service';
import { IAccountRedeemState, THoyoGame } from '../types/hoyolab';

@Injectable()
@HoyolabCommandDecorator()
export class HoyolabRedeemCommands {
  private readonly logger = new Logger(HoyolabRedeemCommands.name);

  constructor(
    private readonly hoyolabService: HoyolabService,
    private readonly hoyolabEmbeds: HoyolabEmbeds,
  ) {}

  @Subcommand({ name: 'redeem',
    description: 'Redeem giftcode',
  })
  public async redeemGiftcode(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: HoyolabRedeemDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const user = await this.hoyolabService.getUserInfo(interaction.user.id);
    if (!user)
      return interaction.editReply({
        content: '❌ Account data not found, please save the cookie first.',
      });

    const {
      giftcode1,
      giftcode2,
      giftcode3,
      giftcode4,
      giftcode5,
      giftcode6,
      giftcode7,
      giftcode8,
      giftcode9,
      giftcode10,
      target,
    } = dto;
    const giftcodes = Array.from(
      new Set([
        giftcode1,
        giftcode2,
        giftcode3,
        giftcode4,
        giftcode5,
        giftcode6,
        giftcode7,
        giftcode8,
        giftcode9,
        giftcode10,
      ]),
    ).filter(Boolean) as string[];

    let totalAccounts = 0;
    const targetAccounts: Array<{
      uid: string;
      nickname: string;
      game: THoyoGame;
    }> = [];
    if (user.hoyoUsers) {
      for (const hoyoUser of user.hoyoUsers) {
        const matchingAccounts = hoyoUser.gameAccounts.filter(
          (a: any) => a.game === target,
        );
        for (const acc of matchingAccounts) {
          targetAccounts.push({
            uid: acc.game_uid,
            nickname: acc.nickname,
            game: acc.game as THoyoGame,
          });
        }
        totalAccounts += matchingAccounts.length;
      }
    }

    if (totalAccounts === 0) {
      return interaction.editReply({
        content: '❌ No target game accounts found to redeem codes for.',
      });
    }

    if (totalAccounts > 10) {
      return interaction.editReply({
        content: `❌ Too many accounts (${totalAccounts}). Discord limits restrict rendering to a maximum of 10 embeds. Please remove some accounts to proceed.`,
      });
    }

    const accountStates: Array<IAccountRedeemState> = targetAccounts.map(
      (acc) => ({
        uid: acc.uid,
        nickname: acc.nickname,
        game: acc.game,
        blocks: [],
        statusText: 'Waiting for redemption to start...',
      }),
    );

    await interaction.editReply({
      content: `🚀 Starting redemption for **${totalAccounts}** accounts with **${giftcodes.length}** codes...`,
      embeds: this.hoyolabEmbeds.redeemProgressEmbeds(
        accountStates,
        giftcodes.length,
      ),
    });

    for (let i = 0; i < giftcodes.length; i++) {
      const giftcode = giftcodes[i];
      try {
        await this.hoyolabService.redeemCode(
          user,
          target,
          giftcode,
          async (account, resultStatus) => {
            let statusEmoji = '❌';
            let blockEmoji = '🟥';

            if (resultStatus.code === 0) {
              statusEmoji = '✅';
              blockEmoji = '🟩';
            } else if (
              resultStatus.code === -2017 ||
              resultStatus.code === -5003
            ) {
              statusEmoji = '⏺';
              blockEmoji = '🟨';
            }

            const state = accountStates.find((s) => s.uid === account.game_uid);
            if (state) {
              state.blocks.push(blockEmoji);
              state.statusText = `${statusEmoji} ${resultStatus.message}`;
            }

            try {
              await interaction.editReply({
                content: `🚀 Redeeming codes... (Processing code **${i + 1}/${giftcodes.length}**)`,
                embeds: this.hoyolabEmbeds.redeemProgressEmbeds(
                  accountStates,
                  giftcodes.length,
                ),
              });
            } catch {
              // Ignore rate limits or temporary errors during progress update
            }
          },
        );
      } catch (err: any) {
        return interaction.editReply({
          content: err.message || '❌ Target not redeemable',
        });
      }
    }

    await interaction.editReply({
      content: '✅ **Redemption Complete!** Summary below:',
      embeds: this.hoyolabEmbeds.redeemProgressEmbeds(
        accountStates,
        giftcodes.length,
      ),
    });
  }
}
