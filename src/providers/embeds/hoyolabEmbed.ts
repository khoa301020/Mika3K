import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { Client } from 'discordx';
import { IHoYoLAB, IHoYoLABGameAccount, IRedeemResult } from '../../types/hoyolab';

export const HoYoLABInfoEmbed = (user: IHoYoLAB, client: Client): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`Your HoYoLAB info`)
    .addFields(
      ...user.hoyoUsers.map(
        (account): APIEmbedField => ({
          name: account.remark,
          value: account.gameAccounts
            .map((gameAccount: IHoYoLABGameAccount) => {
              return `- [${gameAccount.game?.toUpperCase()}${gameAccount.game_uid}] ${gameAccount.nickname}`;
            })
            .join('\n'),
        }),
      ),
    )
    .setTimestamp()
    .setFooter({ text: `Xiaomi3K`, iconURL: client.user!.displayAvatarURL() });
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