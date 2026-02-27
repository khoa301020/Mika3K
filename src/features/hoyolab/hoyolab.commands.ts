import { Injectable, Logger } from '@nestjs/common';
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageFlags,
} from 'discord.js';
import { Context, Options, StringSelect, SlashCommand } from 'necord';
import type { SlashCommandContext, StringSelectContext } from 'necord';
import { HoyolabService } from './hoyolab.service';
import { HoyolabEmbeds } from './hoyolab.embeds';
import { AppCacheService } from '../../shared/cache';
import { AppHttpService } from '../../shared/http';
import {
  HoyolabSaveTokenDto,
  HoyolabNoteDto,
  HoyolabRedeemDto,
  HoyolabDeleteRemarkDto,
} from './dto/hoyolab.dto';
import { HoYoLABConstants } from './hoyolab.constants';
import {
  IHoYoLABGameAccount,
  THoyoGame,
  IAccountRedeemState,
} from './types/hoyolab';
const parseCookies = (cookieString: string) => {
  return cookieString
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc: any, v) => {
      if (v[0] && v[1])
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
};

@Injectable()
export class HoyolabCommands {
  private readonly logger = new Logger(HoyolabCommands.name);

  constructor(
    private readonly hoyolabService: HoyolabService,
    private readonly hoyolabEmbeds: HoyolabEmbeds,
    private readonly cacheService: AppCacheService,
    private readonly httpService: AppHttpService,
  ) {}

  @SlashCommand({
    name: 'hoyo-save-token',
    description: 'Save Mihoyo cookie token',
  })
  public async saveToken(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: HoyolabSaveTokenDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    let { cookie } = dto;
    const { remark } = dto;

    const parsedCookie = parseCookies(cookie);
    if (!parsedCookie.cookie_token || !parsedCookie.account_id) {
      if (!parsedCookie.cookie_token_v2 || !parsedCookie.account_id_v2) {
        return interaction.editReply({ content: '❌ Cookie invalid.' });
      }
    }

    cookie = Object.entries(parsedCookie)
      .map(([key, value]) =>
        [
          'cookie_token',
          'account_id',
          'cookie_token_v2',
          'account_id_v2',
        ].includes(key)
          ? `${key}=${String(value)}; `
          : '',
      )
      .join('');

    try {
      const res: any = await this.httpService.get(
        HoYoLABConstants.HOYOLAB_GET_USER,
        { headers: { cookie } },
      );
      if (res.data?.retcode === -100 || res.retcode === -100)
        return interaction.editReply({ content: '❌ Cookie expired.' });

      await this.cacheService.set(`${interaction.user.id}-hoyolab`, {
        remark,
        cookie,
        listAccounts: res.data?.data?.list || res.data?.list,
      });

      const gameAccounts: Array<IHoYoLABGameAccount> =
        res.data?.data?.list || res.data?.list;

      const gameAccountsSelectComponent = new StringSelectMenuBuilder()
        .setCustomId('hoyoSelectAccount')
        .setPlaceholder(`Select account for **${remark}** (multiple choices)`)
        .setMinValues(1)
        .setMaxValues(gameAccounts.length)
        .addOptions(
          gameAccounts.map((gameAccount) => {
            const game = Object.entries(HoYoLABConstants.REDEEM_TARGET).find(
              ([, value]) =>
                value.prefix === gameAccount.game_biz.split('_')[0],
            )?.[0] as THoyoGame;
            const isMaxLevel =
              Math.max(...gameAccounts.map((a) => a.level)) ===
              gameAccount.level;
            return {
              label: `[${gameAccount.game_uid}] (${gameAccount.nickname}) - Lv. ${gameAccount.level}`,
              description: `${(game || 'Unknown').toUpperCase()} - ${gameAccount.region_name}`,
              value: gameAccount.game_uid,
              default: isMaxLevel,
            };
          }),
        );

      const rowSelectAccount =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          gameAccountsSelectComponent,
        );

      return interaction.editReply({
        content: `Select account for **${remark}** (multiple choices)`,
        components: [rowSelectAccount as any],
      });
    } catch (e) {
      this.logger.error('Error fetching Hoyolab user:', e);
      return interaction.editReply({
        content: '❌ Cookie invalid or API error.',
      });
    }
  }

  @StringSelect('hoyoSelectAccount')
  public async handleSelectAccount(
    @Context() [interaction]: StringSelectContext,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const cachedHoyoInfo = await this.cacheService.get<{
      remark: string;
      cookie: string;
      listAccounts: Array<IHoYoLABGameAccount>;
    }>(`${interaction.user.id}-hoyolab`);

    if (!cachedHoyoInfo) {
      return interaction.editReply({
        content: '❌ Session expired or error occurred.',
      });
    }

    await this.cacheService.del(`${interaction.user.id}-hoyolab`);

    const uids: Array<string> = interaction.values;
    const selectedAccounts = cachedHoyoInfo.listAccounts.filter(
      (account: any) => uids.includes(account.game_uid),
    );

    const user = await this.hoyolabService.saveCredentials(
      interaction.user.id,
      cachedHoyoInfo.remark,
      cachedHoyoInfo.cookie,
      selectedAccounts,
    );

    if (!user)
      return interaction.editReply({ content: '❌ Failed to save user.' });

    return interaction.editReply({
      content: `✅ Saved user remark **${cachedHoyoInfo.remark}** for ${user.userId}`,
    });
  }

  @SlashCommand({ name: 'hoyo-info', description: 'Get your HoYoLAB info' })
  public async info(@Context() [interaction]: SlashCommandContext) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const user = await this.hoyolabService.getUserInfo(interaction.user.id);
    if (!user)
      return interaction.editReply({
        content: '❌ Account data not found, please save the cookie first.',
      });

    const embed = this.hoyolabEmbeds.info(user as any);
    return interaction.editReply({ embeds: [embed] });
  }

  @SlashCommand({ name: 'hoyo-note', description: 'Get HoYoLAB game note' })
  public async note(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: HoyolabNoteDto,
  ) {
    await interaction.deferReply();
    const user = await this.hoyolabService.getUserInfo(interaction.user.id);
    if (!user)
      return interaction.editReply({
        content: '❌ Account data not found, please save the cookie first.',
      });

    const gameAccounts = user.hoyoUsers
      .map((hoyoUser) =>
        hoyoUser.gameAccounts
          .filter((gameAccount) => gameAccount.game === dto.target)
          .map((gameAccount) =>
            Object.assign(gameAccount, { cookie: hoyoUser.cookieString }),
          ),
      )
      .flat();

    if (gameAccounts.length === 0)
      return interaction.editReply({ content: '❌ No account found.' });

    let notes = await Promise.all(
      gameAccounts.map(async (gameAccount: any) => {
        const { cookie } = gameAccount;
        try {
          const res = await this.hoyolabService.getNote(gameAccount, cookie);
          const noteData = res.data;
          if (noteData) {
            noteData.id = gameAccount.game_uid;
            noteData.nickname = gameAccount.nickname;
          }
          return noteData;
        } catch {
          return null;
        }
      }),
    );

    notes = notes.filter((note) => note !== null);

    if (notes.length === 0)
      return interaction.editReply({
        content: '❌ No note found or API returned empty.',
      });

    const embeds = notes.map((note) =>
      this.hoyolabEmbeds.note(note, dto.target),
    );
    return interaction.editReply({ embeds });
  }

  @SlashCommand({
    name: 'hoyo-delete-remark',
    description: 'Delete HoYoLAB user remark',
  })
  public async deleteRemark(
    @Context() [interaction]: SlashCommandContext,
    @Options() dto: HoyolabDeleteRemarkDto,
  ) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    try {
      await this.hoyolabService.deleteAccount(interaction.user.id, dto.remark);
      return interaction.editReply({
        content: `✅ User remark **${dto.remark}** has been deleted.`,
      });
    } catch (err: any) {
      return interaction.editReply({
        content: err.message || '❌ Error deleting remark.',
      });
    }
  }

  @SlashCommand({
    name: 'hoyo-redeem-giftcode',
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
