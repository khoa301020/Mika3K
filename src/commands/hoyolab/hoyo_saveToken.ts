import axios from 'axios';
import {
  APISelectMenuOption,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  ComponentType,
  Message,
  MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { Discord, SelectMenuComponent, Slash, SlashGroup, SlashOption } from 'discordx';
import { HoYoLABConstants } from '../../constants/index.js';
import { cache } from '../../main.js';
import { hoyolabApi } from '../../services/hoyolab.js';
import { IHoYoLABGameAccount, THoyoGame } from '../../types/hoyolab.js';
import { editOrReplyThenDelete, parseCookies } from '../../utils/index.js';

@Discord()
@SlashGroup({ name: 'hoyolab', description: 'HoYoLAB commands' })
export class HoYoLABSaveToken {
  @SlashGroup('hoyolab')
  @Slash({ description: 'Save Mihoyo cookie token', name: 'save-token' })
  async saveToken(
    @SlashOption({
      description: 'Remark for this HoYoLAB user (max 20 characters)',
      name: 'remark',
      required: true,
      maxLength: 20,
      type: ApplicationCommandOptionType.String,
    })
    remark: string,
    @SlashOption({
      description: 'Cookie token string',
      name: 'cookie',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    cookie: string,
    interaction: CommandInteraction,
  ): Promise<Message<boolean> | void> {
    await interaction.deferReply({ ephemeral: true });
    const parsedCookie = parseCookies(cookie);
    if (!parsedCookie.cookie_token || !parsedCookie.account_id)
      if (!parsedCookie.cookie_token_v2 || !parsedCookie.account_id_v2)
        return editOrReplyThenDelete(interaction, '❌ Cookie invalid.');

    cookie = Object.entries(parsedCookie)
      .map(([key, value]) =>
        ['cookie_token', 'account_id', 'cookie_token_v2', 'account_id_v2'].includes(key) ? `${key}=${value}; ` : '',
      )
      .join('');

    const res = await axios.get(HoYoLABConstants.HOYOLAB_GET_USER, { headers: { cookie } }).catch(() => null);
    if (!res) return editOrReplyThenDelete(interaction, '❌ Cookie invalid.');
    if (res.data.retcode === -100) return editOrReplyThenDelete(interaction, '❌ Cookie expired.');

    cache.set(`${interaction.user.id}-hoyolab`, { remark, cookie, listAccounts: res.data.data.list });

    const gameAccounts: Array<IHoYoLABGameAccount> = res.data.data.list;

    const gameAccountsSelectComponent: StringSelectMenuBuilder = new StringSelectMenuBuilder({
      type: ComponentType.StringSelect,
      placeholder: `Select account for **${remark}** (multiple choices)`,
      customId: 'hoyoSelectAccount',
      minValues: 1,
      maxValues: gameAccounts.length,
      options: gameAccounts.map((gameAccount): APISelectMenuOption => {
        const game = Object.entries(HoYoLABConstants.REDEEM_TARGET).find(
          ([, value]) => value.prefix === gameAccount.game_biz.split('_')[0],
        )?.[0] as THoyoGame;
        return {
          label: `[${gameAccount.game_uid}] (${gameAccount.nickname}) - Lv. ${gameAccount.level}`,
          description: `${game.toUpperCase()} - ${gameAccount.region_name}`,
          value: gameAccount.game_uid,
          default: Math.max(...gameAccounts.map((gameAccount) => gameAccount.level)) === gameAccount.level,
        };
      }),
    });

    const rowSelectAccount = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      gameAccountsSelectComponent,
    );

    return interaction.editReply({
      content: `Select account for **${remark}** (multiple choices)`,
      components: [rowSelectAccount],
    });
  }

  @SelectMenuComponent({ id: 'hoyoSelectAccount' })
  async handle(interaction: StringSelectMenuInteraction): Promise<unknown> {
    await interaction.deferReply({ ephemeral: true });

    const cachedHoyoInfo: { remark: string; cookie: string; listAccounts: Array<IHoYoLABGameAccount> } | undefined =
      cache.take(`${interaction.user.id}-hoyolab`);
    if (!cachedHoyoInfo) return editOrReplyThenDelete(interaction, { content: '❌ Error occurred.', ephemeral: true });
    const uids: Array<string> = interaction.values;
    const user = await hoyolabApi.saveCredentials(
      interaction.user.id,
      cachedHoyoInfo.remark,
      cachedHoyoInfo.cookie,
      cachedHoyoInfo.listAccounts.filter((account) => uids.includes(account.game_uid)),
    );
    if (!user) return editOrReplyThenDelete(interaction, '❌ User invalid.');

    return await interaction.followUp({
      content: `✅ Saved user remark **${cachedHoyoInfo.remark}** for ${user.userId}`,
      ephemeral: true,
    });
  }
}
