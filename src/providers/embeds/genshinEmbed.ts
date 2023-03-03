import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { Client } from 'discordx';
import { IGenshinAccount } from '../../types/genshin.js';

export const GenshinAccountEmbed = (
  account: IGenshinAccount,
  client: Client,
  page: number,
  total: number,
): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`[UID ${account.game_uid}] ${account.nickname}`)
    .addFields({ name: 'Region', value: `[${account.region}] ${account.region_name}` })
    .addFields({ name: 'World rank', value: account.level.toString() })
    .setTimestamp()
    .setFooter({ text: `Xiaomi3K (${page}/${total})`, iconURL: client.user!.displayAvatarURL() });
};

export const GenshinRedeemResultEmbed = (results: Array<any>, client: Client): EmbedBuilder => {
  const fields: Array<APIEmbedField> = [];

  for (const result of results)
    fields.push({
      name: result.giftcode,
      value: result.res.data.retcode === 0 ? '```✅ Success```' : `\`\`\`❌ ${result.res.data.message}\`\`\``,
    });

  console.log(fields);

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`Redeem result`)
    .addFields(fields)
    .setTimestamp()
    .setFooter({ text: `Xiaomi3K`, iconURL: client.user!.displayAvatarURL() });
};
