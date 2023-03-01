import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { Constants } from '../../constants/constants.js';
import { convertedFields } from '../../services/saucenao.js';
import { ISaucenaoSearchResponseResult } from '../../types/saucenao.js';
export const SauceNAOResultEmbed = (
  author: User,
  result: ISaucenaoSearchResponseResult,
  page?: number,
  total?: number,
): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(
      `[${Constants.SAUCENAO_SOURCES[result.header?.index_id!.toString() as keyof Object]}] ${
        result.data?.title ?? ''
      } \`${result.header?.similarity}%\``,
    )
    .setURL(result.header?.thumbnail ?? null)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`${result.header?.index_name}`)
    .addFields(convertedFields(result.data))
    .setThumbnail(Constants.SAUCENAO_LOGO)
    .setImage(result.header?.thumbnail ?? null)
    .setTimestamp()
    .setFooter({ text: `SauceNAO (${page}/${total})`, iconURL: Constants.SAUCENAO_LOGO });
};
