import { ApplicationCommandOptionType, CommandInteraction, InteractionResponse } from 'discord.js';
import { Client, Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { setTimeout } from 'timers/promises';
import { HoYoLABConstants } from '../../constants/hoyolab.js';
import { editOrReplyThenDelete, isObjectEmpty, parseCookies } from '../../helpers/helper.js';
import { HoYoLABAccountEmbed, HoYoLABRedeemResultEmbed } from '../../providers/embeds/hoyolabEmbed.js';
import { HoYoLAB_ButtonPagination } from '../../providers/paginations/hoyolabPagination.js';
import { hoyolabApi } from '../../services/hoyolab.js';
import { IHoYoLAB, IHoYoLABAccount, IHoYoLABResponse, THoyoGame } from '../../types/hoyolab.js';

@Discord()
@SlashGroup({ name: 'hoyolab', description: 'HoYoLAB commands' })
export class HoYoLABRedeem {
  @SlashGroup('hoyolab')
  @Slash({ description: 'Save Mihoyo cookie token', name: 'save-token' })
  async saveToken(
    @SlashOption({
      description: 'Cookie token string',
      name: 'cookie',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    cookie: string,
    interaction: CommandInteraction,
  ): Promise<InteractionResponse<boolean> | void> {
    const userId = interaction.user.id;
    const parsedCookie = parseCookies(cookie);
    if (!parsedCookie.cookie_token || !parsedCookie.account_id)
      return editOrReplyThenDelete(interaction, '❌ Cookie invalid.');

    const user = await hoyolabApi.saveCredentials(userId, parsedCookie, cookie);
    if (!user) return editOrReplyThenDelete(interaction, '❌ User invalid.');

    return interaction.reply('✅ Save token succeed.');
  }

  @SlashGroup('hoyolab')
  @Slash({ description: 'List game accounts', name: 'list-account' })
  async listAccount(interaction: CommandInteraction): Promise<any> {
    await interaction.deferReply({ ephemeral: false });
    const userId = interaction.user.id;
    const user: IHoYoLAB = await hoyolabApi.getUserInfo(userId);
    if (!user || !user.cookieString)
      return editOrReplyThenDelete(interaction, '❌ Cookie not found, please save the cookie first.');

    const response: IHoYoLABResponse = await (await hoyolabApi.getUserAccount(user.cookieString)).data;
    const accounts: Array<IHoYoLABAccount> = response.data?.list!;

    const pages = accounts.map((account: IHoYoLABAccount, index: number) => {
      const embed = HoYoLABAccountEmbed(account, interaction.client as Client, index + 1, accounts.length);

      return { embeds: [embed] };
    });

    const pagination = HoYoLAB_ButtonPagination(interaction, pages, false);
    return await pagination.send();
  }

  @SlashGroup('hoyolab')
  @Slash({ description: 'Select game account', name: 'select-account' })
  async selectAccount(
    @SlashChoice(
      ...Object.entries(HoYoLABConstants.REDEEM_TARGET).map(([key, value]) => Object({ name: value.name, value: key })),
    )
    @SlashOption({
      description: 'Target game',
      name: 'target-game',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    target: THoyoGame,
    @SlashOption({
      description: 'HoYoLAB account UID',
      name: 'uid',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    uid: string,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;
    const user: IHoYoLAB = await hoyolabApi.getUserInfo(userId);
    if (!user || !user.cookieString)
      return editOrReplyThenDelete(interaction, '❌ Cookie not found, please save the cookie first.');

    const response: IHoYoLABResponse = await (await hoyolabApi.getUserAccount(user.cookieString)).data;
    const accounts: Array<IHoYoLABAccount> = response.data?.list!;

    const selectedAccount = accounts.find(
      (account: IHoYoLABAccount) =>
        account.game_uid === uid && account.game_biz.startsWith(HoYoLABConstants.REDEEM_TARGET[target].prefix),
    );

    if (!selectedAccount) return editOrReplyThenDelete(interaction, '❌ Account not found.');

    await hoyolabApi.selectAccount(userId, target, selectedAccount);

    return interaction.editReply('✅ Select account succeed.');
  }

  @SlashGroup('hoyolab')
  @Slash({ description: 'Redeem giftcode', name: 'redeem-giftcode' })
  async redeemGiftcode(
    @SlashChoice(
      ...Object.entries(HoYoLABConstants.REDEEM_TARGET).map(([key, value]) => Object({ name: value.name, value: key })),
    )
    @SlashOption({
      description: 'Target game',
      name: 'target-game',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    target: THoyoGame,
    @SlashOption({
      description: 'Giftcode 1 (mandatory)',
      name: 'giftcode1',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    giftcode1: string | undefined,
    @SlashOption({
      description: 'Giftcode 2 (optional)',
      name: 'giftcode2',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    giftcode2: string | undefined,
    @SlashOption({
      description: 'Giftcode 3 (optional)',
      name: 'giftcode3',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    giftcode3: string | undefined,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;
    const user: IHoYoLAB = await hoyolabApi.getUserInfo(userId);
    if (!user || !user.cookieString)
      return editOrReplyThenDelete(interaction, '❌ Cookie not found, please save the cookie first.');
    if (!user[`${target}Account` as keyof Object] || isObjectEmpty(user[`${target}Account` as keyof Object]))
      return editOrReplyThenDelete(interaction, '❌ Account data not found, please select account.');

    const giftcodes = Array.from(new Set([giftcode1, giftcode2, giftcode3])).filter((giftcode) => giftcode);

    let results: Array<any> = [];
    let timeout: number = 0;

    for (let index = 0; index < giftcodes.length; index++) {
      await hoyolabApi
        .redeemCode(user, target, giftcodes[index]!)
        .then((res) => results.push({ giftcode: giftcodes[index], res }));
      if (giftcodes[index + 1]) {
        timeout += 5555;
        await setTimeout(timeout);
      }
    }

    const embed = HoYoLABRedeemResultEmbed(results, interaction.client as Client);
    return interaction.editReply({ embeds: [embed] });
  }
}
