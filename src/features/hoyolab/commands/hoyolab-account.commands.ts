import { HoyolabCommandDecorator } from './decorators';
import { Injectable, Logger } from '@nestjs/common';
import {
    ActionRowBuilder,
    MessageFlags,
    StringSelectMenuBuilder,
} from 'discord.js';
import type { SlashCommandContext, StringSelectContext } from 'necord';
import { Context, Options, Subcommand, StringSelect } from 'necord';
import { AppCacheService } from '../../../shared/cache';
import { AppHttpService } from '../../../shared/http';
import {
    HoyolabDeleteRemarkDto,
    HoyolabNoteDto,
    HoyolabSaveTokenDto,
} from '../dto/hoyolab.dto';
import { HoYoLABConstants } from '../hoyolab.constants';
import { HoyolabEmbeds } from '../hoyolab.embeds';
import { HoyolabService } from '../hoyolab.service';
import { IHoYoLABGameAccount, THoyoGame } from '../types/hoyolab';

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
@HoyolabCommandDecorator()
export class HoyolabAccountCommands {
  private readonly logger = new Logger(HoyolabAccountCommands.name);

  constructor(
    private readonly hoyolabService: HoyolabService,
    private readonly hoyolabEmbeds: HoyolabEmbeds,
    private readonly cacheService: AppCacheService,
    private readonly httpService: AppHttpService,
  ) {}

  @Subcommand({ name: 'save',
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

  @Subcommand({ name: 'info', description: 'Get your HoYoLAB info' })
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

  @Subcommand({ name: 'note', description: 'Get HoYoLAB game note' })
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

  @Subcommand({ name: 'delete_remark',
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
}
