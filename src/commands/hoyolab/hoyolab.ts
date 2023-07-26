import { ApplicationCommandOptionType, CommandInteraction, Message } from 'discord.js';
import { Client, Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { setTimeout } from 'timers/promises';
import { HoYoLABConstants } from '../../constants/hoyolab.js';
import { editOrReplyThenDelete, parseCookies } from '../../helpers/helper.js';
import { HoYoLABRedeemResultEmbed } from '../../providers/embeds/hoyolabEmbed.js';
import { hoyolabApi } from '../../services/hoyolab.js';
import { IHoYoLAB, IRedeemResult, THoyoGame } from '../../types/hoyolab.js';

@Discord()
@SlashGroup({ name: 'hoyolab', description: 'HoYoLAB commands' })
export class HoYoLABRedeem {
  @SlashGroup('hoyolab')
  @Slash({ description: 'Save Mihoyo cookie token', name: 'save-token' })
  async saveToken(
    @SlashOption({
      description: 'Remark for this HoYoLAB user',
      name: 'remark',
      required: true,
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
    @SlashOption({
      description: 'Game accounts UIDs (separated by comma)',
      name: 'uids',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    selectedUIDs: string,
    interaction: CommandInteraction,
  ): Promise<Message<boolean> | void> {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;
    const parsedCookie = parseCookies(cookie);
    if (!parsedCookie.cookie_token_v2 || !parsedCookie.account_id_v2)
      return editOrReplyThenDelete(interaction, '❌ Cookie invalid.');

    const uids: Array<string> = selectedUIDs.split(',').map((uid) => uid.trim());

    const user = await hoyolabApi.saveCredentials(userId, remark, cookie, uids);
    if (!user) return editOrReplyThenDelete(interaction, '❌ User invalid.');

    return interaction.editReply('✅ Save token succeed.');
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
    if (!user) return editOrReplyThenDelete(interaction, '❌ Cookie not found, please save the cookie first.');

    const giftcodes = Array.from(new Set([giftcode1, giftcode2, giftcode3])).filter((giftcode) => giftcode);

    let results: Array<{
      giftcode: string | undefined;
      result: Array<IRedeemResult>;
    }> = [];
    let timeout: number = 0;

    for (let index = 0; index < giftcodes.length; index++) {
      await hoyolabApi
        .redeemCode(user, target, giftcodes[index]!)
        .then((res: Array<IRedeemResult>) => results.push({ giftcode: giftcodes[index], result: res }));
      if (giftcodes[index + 1]) {
        timeout += 5555;
        await setTimeout(timeout);
      }
    }

    const embed = HoYoLABRedeemResultEmbed(results, interaction.client as Client);
    return interaction.editReply({ embeds: [embed] });
  }
}
