import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { NHentaiConstants, SauceNAOConstants } from '../../constants/index.js';
import { resultsToEmbedFields } from '../../services/saucenao.js';
import { ISaucenaoSearchResponseResult } from '../../types/saucenao.js';
export const SauceNAOResultEmbed = (
  author: User,
  result: ISaucenaoSearchResponseResult,
  page?: number,
  total?: number,
): EmbedBuilder => {
  const nuke =
    SauceNAOConstants.SAUCENAO_SOURCES[result.header?.index_id!] === 'NHentai'
      ? {
          code: result.header?.thumbnail!.match(/res\/nhentai\/(\d+)/)?.[1],
          get url() {
            return `${NHentaiConstants.NHENTAI_BASE_URL}/g/${this.code}`;
          },
          get title() {
            return `[${this.code}] ${result.data.source}`;
          },
        }
      : null;
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(
      `[${SauceNAOConstants.SAUCENAO_SOURCES[result.header?.index_id!]}] ${
        nuke ? nuke.title : result.data?.title
      } \`${result.header?.similarity}%\``,
    )
    .setURL(nuke ? nuke.url : result.header?.thumbnail ?? null)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`${result.header?.index_name}`)
    .addFields(resultsToEmbedFields(result.data))
    .setThumbnail(SauceNAOConstants.SAUCENAO_LOGO)
    .setImage(result.header?.thumbnail ?? null)
    .setTimestamp()
    .setFooter({ text: `SauceNAO (${page}/${total})`, iconURL: SauceNAOConstants.SAUCENAO_LOGO });
};
