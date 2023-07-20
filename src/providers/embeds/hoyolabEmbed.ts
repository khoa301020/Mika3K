import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { Client } from 'discordx';
import { HoYoLABConstants } from '../../constants/hoyolab.js';
import { IHoYoLABAccount } from '../../types/hoyolab.js';

export const HoYoLABAccountEmbed = (
  account: IHoYoLABAccount,
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

export const HoYoLABRedeemResultEmbed = (results: Array<any>, client: Client): EmbedBuilder => {
  const fields: Array<APIEmbedField> = [];

  for (const result of results)
    fields.push({
      name: result.giftcode,
      value: result.res.data.retcode === 0 ? '```✅ Success```' : `\`\`\`❌ ${result.res.data.message}\`\`\``,
    });

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`Redeem result`)
    .addFields(fields)
    .setTimestamp()
    .setFooter({ text: `Xiaomi3K`, iconURL: client.user!.displayAvatarURL() });
};
