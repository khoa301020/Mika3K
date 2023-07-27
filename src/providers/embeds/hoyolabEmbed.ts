import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { Client } from 'discordx';
import { HoYoLABConstants } from '../../constants/index.js';
import { IHoYoLABGameAccount, IRedeemResult } from '../../types/hoyolab.js';

export const HoYoLABAccountEmbed = (
  account: IHoYoLABGameAccount,
  client: Client,
  page: number,
  total: number,
): EmbedBuilder => {
  return (
    new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`[UID ${account.game_uid}] ${account.nickname}`)
      // Game is the value in HoYoLABConstants.HOYOLAB_GAME_PREFIX if the key is the prefix of account.game_biz
      .addFields({
        name: 'Game',
        value: Object.entries(HoYoLABConstants.REDEEM_TARGET).find(([, value]) =>
          account.game_biz.startsWith(value.prefix),
        )![1].name,
      })
      .addFields({ name: 'Region', value: `[${account.region}] ${account.region_name}` })
      .addFields({ name: 'World rank', value: account.level.toString() })
      .setTimestamp()
      .setFooter({ text: `Xiaomi3K (${page}/${total})`, iconURL: client.user!.displayAvatarURL() })
  );
};

export const HoYoLABRedeemResultEmbed = (
  results: Array<{
    giftcode: string | undefined;
    result: Array<IRedeemResult>;
  }>,
  client: Client,
): EmbedBuilder => {
  const fields: Array<APIEmbedField> = [];

  for (const [key, result] of Object.entries(results))
    fields.push({
      name: `Giftcode ${parseInt(key) + 1}: ${result.giftcode}`,
      value: result.result
        .map((res: IRedeemResult) => {
          const accounts = res.accounts.map((account) => {
            if (account.code) {
              switch (account.code) {
                case 0:
                  return ` - [${account.uid}] ${account.nickname} ✅`;
                case -5003:
                  return ` - [${account.uid}] ${account.nickname} ⏺`;
                default:
                  return ` - [${account.uid}] ${account.nickname} ❌`;
              }
            } else {
              return ` - [${account.uid}] ${account.nickname} - ❌`;
            }
          });
          return `${res.remark}\n${accounts.join('\n')}`;
        })
        .join('\n\n'),
    });

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`Redeem result`)
    .addFields(fields)
    .setTimestamp()
    .setFooter({ text: `Xiaomi3K`, iconURL: client.user!.displayAvatarURL() });
};
