import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { setTimeout } from 'timers/promises';
import { HoYoLABConstants } from '../../constants/index.js';
import { HoYoLABRedeemResultEmbed } from '../../providers/embeds/hoyolabEmbed.js';
import { hoyolabApi } from '../../services/hoyolab.js';
import { IHoYoLAB, IRedeemResult, THoyoGame } from '../../types/hoyolab.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
@SlashGroup({ name: 'hoyolab', description: 'HoYoLAB commands' })
export class HoYoLABRedeem {
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
      description: 'Giftcode 1 (compulsory)',
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
    const user: IHoYoLAB | null = await hoyolabApi.getUserInfo(userId);
    if (!user) return editOrReplyThenDelete(interaction, '❌ Account data not found, please save the cookie first.');

    const giftcodes = Array.from(new Set([giftcode1, giftcode2, giftcode3])).filter((giftcode) => giftcode);

    let results: Array<{
      giftcode: string | undefined;
      result: Array<IRedeemResult>;
    }> = [];
    let timeout: number = 0;

    for (let index = 0; index < giftcodes.length; index++) {
      await hoyolabApi
        .redeemCode(user, target, giftcodes[index]!)
        .then((res: Array<IRedeemResult>) => results.push({ giftcode: giftcodes[index], result: res }))
        .catch((err) => {
          return editOrReplyThenDelete(interaction, { content: err });
        });
      if (giftcodes[index + 1]) {
        timeout += 5555;
        await setTimeout(timeout);
      }
    }

    const embed = HoYoLABRedeemResultEmbed(results);
    return interaction.editReply({ embeds: [embed] });
  }
}
