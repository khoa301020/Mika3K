import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { NHentaiConstants } from '../../constants/index.js';
import { INHentai, Tag } from '../../types/nhentai.js';
import { datetimeConverter, sortArray } from '../../utils/index.js';

// export const NHentaiEmbed = (nhentai: INHentai, author: User, page?: number, total?: number): EmbedBuilder => {
export const NHentaiEmbed = (nhentai: INHentai, author: User, page?: number, total?: number): EmbedBuilder => {
  sortArray.desc(nhentai.tags, 'count');

  const parodies = nhentai.tags
    .filter((tag: Tag) => tag.type === 'parody')
    .map((tag: Tag) => `${tag.name} (${tag.count})`);

  const characters = nhentai.tags
    .filter((tag: Tag) => tag.type === 'character')
    .map((tag: Tag) => `${tag.name} (${tag.count})`);

  const artists = nhentai.tags
    .filter((tag: Tag) => tag.type === 'artist')
    .map((tag: Tag) => `${tag.name} (${tag.count})`);

  const tags = nhentai.tags.filter((tag: Tag) => tag.type === 'tag').map((tag: Tag) => `${tag.name} (${tag.count})`);

  const searchPagination =
    nhentai.current_search_page && nhentai.total_search_page
      ? ` - Page ${nhentai.current_search_page}/${nhentai.total_search_page}`
      : '';
  const itemPagination = page && total ? ` (${page}/${total})` : '';

  const color = nhentai.tags.find((tag: Tag) => NHentaiConstants.NHENTAI_DANGEROUS_TAGS.includes(tag.name))
    ? NHentaiConstants.NHENTAI_EMBED_COLOR.DANGER
    : NHentaiConstants.NHENTAI_EMBED_COLOR.DEFAULT;

  return (
    new EmbedBuilder()
      .setColor(color)
      .setTitle(`[${nhentai.id}] ${nhentai.title.japanese ? nhentai.title.japanese : nhentai.title.pretty}`)
      .setURL(`${NHentaiConstants.NHENTAI_BASE_URL}/g/${nhentai.id}`)
      .setAuthor({
        name: `${author.username}#${author.discriminator}`,
        iconURL: author.displayAvatarURL(),
      })
      .setDescription(nhentai.title.english ? nhentai.title.english : 'No English names.')
      .setThumbnail(NHentaiConstants.NHENTAI_LOGO)
      .addFields(
        { name: 'Parodies', value: `\`\`\`${parodies.length > 0 ? parodies.join('\n') : 'original'}\`\`\`` },
        { name: 'Characters', value: `\`\`\`${characters.length > 0 ? characters.join(', ') : 'original'}\`\`\`` },
        { name: 'Artists', value: `\`\`\`${artists.length > 0 ? artists?.join(', ') : 'N/A'}\`\`\`` },
        { name: 'Tags', value: `\`\`\`${tags.length > 0 ? tags?.join(', ') : 'N/A'}\`\`\`` },
        { name: 'Favorites', value: nhentai.num_favorites.toString(), inline: true },
        { name: 'Pages count', value: nhentai.num_pages.toString(), inline: true },
        {
          name: 'Language',
          value: nhentai.tags
            .filter((tag: Tag) => tag.type === 'language')
            .map((tag: Tag) => tag.name)
            .join(', '),
          inline: true,
        },
      )
      .addFields({
        name: 'Upload time',
        value: `${datetimeConverter(nhentai.upload_date * 1000).datetime}`,
      })
      // .setImage(
      //   NHentaiConstants.NHENTAI_COVER(nhentai.media_id, nhentai.images.pages[0].t.split('.').pop()?.charAt(0) as T),
      // )
      .setImage(NHentaiConstants.NHENTAI_COVER(nhentai.media_id, nhentai.images.pages[0].t))
      .setTimestamp()
      .setFooter({
        text: `NHentai${searchPagination}${itemPagination}`,
        // text: `NHentai${itemPagination}`,
        iconURL: NHentaiConstants.NHENTAI_LOGO,
      })
  );
};

// export const NHentaiListEmbed = (nhentai: INHentai, author: User, page?: number, total?: number): EmbedBuilder => {
//   const searchPagination =
//     nhentai.current_search_page && nhentai.total_search_page
//       ? ` - Page ${nhentai.current_search_page}/${nhentai.total_search_page}`
//       : '';
//   const itemPagination = page && total ? ` (${page}/${total})` : '';

//   return (
//     new EmbedBuilder()
//       .setColor(CommonConstants.DEFAULT_EMBED_COLOR)
//       .setTitle(`[${nhentai.id}] ${nhentai.title.japanese ? nhentai.title.japanese : nhentai.title.pretty}`)
//       .setURL(`${NHentaiConstants.NHENTAI_BASE_URL}/g/${nhentai.id}`)
//       .setDescription(nhentai.title.english ? nhentai.title.english : 'No English names.')
//       .setAuthor({
//         name: `${author.username}#${author.discriminator}`,
//         iconURL: author.displayAvatarURL(),
//       })
//       .setThumbnail(NHentaiConstants.NHENTAI_LOGO)
//       .addFields(
//         { name: 'Code', value: `\`\`\`${nhentai.id.toString()}\`\`\`` },
//         { name: 'Pages count', value: nhentai.num_pages.toString(), inline: true },
//         // { name: 'Language', value: nhentai.lang, inline: true },
//         {
//           name: 'Language',
//           value: nhentai.tags
//             .filter((tag: Tag) => tag.type === 'language')
//             .map((tag: Tag) => tag.name)
//             .join(', '),
//           inline: true,
//         },
//       )
//       // .setImage(NHentaiConstants.NHENTAI_COVER(nhentai.media_id, nhentai.pages_string.charAt(0) as T))
//       .setImage(NHentaiConstants.NHENTAI_COVER(nhentai.media_id, nhentai.images.pages[0].t))
//       .setTimestamp()
//       .setFooter({
//         text: `NHentai${searchPagination}${itemPagination}`,
//         iconURL: NHentaiConstants.NHENTAI_LOGO,
//       })
//   );
// };
