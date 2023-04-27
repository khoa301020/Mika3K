import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { NHentaiConstants } from '../../constants/index.js';
import { sortArray } from '../../helpers/helper.js';
import { INHentai, Tag } from '../../types/nhentai.js';

export const NHentaiEmbed = (nhentai: INHentai, author: User): EmbedBuilder => {
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

  return (
    new EmbedBuilder()
      .setColor(0x0099ff)
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
        { name: 'Language', value: nhentai.lang, inline: true },
      )
      // .addFields({
      //   name: 'Upload time',
      //   value: `${datetimeConverter(Math.floor(parseInt(nhentai.upload_time))).datetime}`,
      // })
      .setImage(nhentai.images.cover.t)
      .setTimestamp()
      .setFooter({ text: 'NHentai', iconURL: NHentaiConstants.NHENTAI_LOGO })
  );
};
