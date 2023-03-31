import { ApplicationCommandOptionType, CommandInteraction, InteractionResponse } from 'discord.js';
import { Client, Discord, Slash, SlashGroup, SlashOption } from 'discordx';
import { setTimeout } from 'timers/promises';
import { isObjectEmpty, parseCookies } from '../../helpers/helper.js';
import { GenshinAccountEmbed, GenshinRedeemResultEmbed } from '../../providers/embeds/genshinEmbed.js';
import { Genshin_ButtonPagination } from '../../providers/paginations/genshinPagination.js';
import { genshinApi } from '../../services/genshin.js';
import { IGenshin, IGenshinAccount, IGenshinResponse } from '../../types/genshin.js';

@Discord()
@SlashGroup({ name: 'genshin', description: 'Genshin commands' })
export class GenshinRedeem {
  @SlashGroup('genshin')
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
  ): Promise<InteractionResponse<boolean>> {
    const userId = interaction.user.id;
    const parsedCookie = parseCookies(cookie);
    if (!parsedCookie.cookie_token || !parsedCookie.account_id) return interaction.reply('❌ Cookie invalid.');

    const user = await genshinApi.saveCredentials(userId, parsedCookie, cookie);
    if (!user) return interaction.reply('❌ User invalid.');

    return interaction.reply('✅ Save token succeed.');
  }

  @SlashGroup('genshin')
  @Slash({ description: 'List user account', name: 'list-account' })
  async listAccount(interaction: CommandInteraction): Promise<any> {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;
    const user: IGenshin = await genshinApi.getUserInfo(userId);
    if (!user || !user.cookieString) return interaction.editReply('❌ Cookie not found, please save cookie first.');

    const response: IGenshinResponse = await (await genshinApi.getUserAccount(user.cookieString)).data;
    const accounts: Array<IGenshinAccount> = response.data?.list!;

    console.log(accounts);

    const pages = accounts.map((account: IGenshinAccount, index: number) => {
      const embed = GenshinAccountEmbed(account, interaction.client as Client, index + 1, accounts.length);

      return { embeds: [embed] };
    });

    const pagination = Genshin_ButtonPagination(interaction, pages, false);
    return await pagination.send();
  }

  @SlashGroup('genshin')
  @Slash({ description: 'Select user account', name: 'select-account' })
  async selectAccount(
    @SlashOption({
      description: 'Genshin account UID',
      name: 'uid',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    uid: string,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;
    const user: IGenshin = await genshinApi.getUserInfo(userId);
    if (!user || !user.cookieString) return interaction.editReply('Cookie not found, please save cookie first.');

    const response: IGenshinResponse = await (await genshinApi.getUserAccount(user.cookieString)).data;
    const accounts: Array<IGenshinAccount> = response.data?.list!;

    const selectedAccount = accounts.find((account: IGenshinAccount) => account.game_uid === uid);

    if (!selectedAccount) return interaction.editReply('❌ Account not found.');

    await genshinApi.selectAccount(userId, selectedAccount);

    return interaction.editReply('✅ Select account succeed.');
  }

  @SlashGroup('genshin')
  @Slash({ description: 'Redeem giftcode', name: 'redeem-giftcode' })
  async redeemGiftcode(
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
    const user: IGenshin = await genshinApi.getUserInfo(userId);
    if (!user || !user.cookieString) return interaction.editReply('❌ Cookie not found, please save cookie first.');
    if (!user.selectedAccount || isObjectEmpty(user.selectedAccount))
      return interaction.editReply('❌ Account data not found, please select account.');

    const giftcodes = Array.from(new Set([giftcode1, giftcode2, giftcode3])).filter((giftcode) => giftcode);

    let results: Array<any> = [];
    let timeout: number = 0;

    for (let index = 0; index < giftcodes.length; index++) {
      await genshinApi
        .redeemCode(user, giftcodes[index]!)
        .then((res) => results.push({ giftcode: giftcodes[index], res }));
      if (giftcodes[index + 1]) {
        timeout += 5555;
        await setTimeout(timeout);
      }
    }

    const embed = GenshinRedeemResultEmbed(results, interaction.client as Client);
    return interaction.editReply({ embeds: [embed] });
  }
}
