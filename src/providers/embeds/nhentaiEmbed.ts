import type { AxiosResponse } from 'axios';
import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { NHentaiConstants } from '../../constants/index.js';
import { datetimeConverter, sortArray } from '../../helpers/helper.js';

export const NHentaiBookEmbed = (res: AxiosResponse, author: User): EmbedBuilder => {
  const book = res.data.data;

  sortArray.desc(book.tags, 'count');

  const parodies = book.tags
    .filter((tag: any) => tag.type === 'parody')
    .map((tag: any) => `${tag.name} (${tag.count})`);

  const characters = book.tags
    .filter((tag: any) => tag.type === 'character')
    .map((tag: any) => `${tag.name} (${tag.count})`);

  const artists = book.tags.filter((tag: any) => tag.type === 'artist').map((tag: any) => `${tag.name} (${tag.count})`);

  const tags = book.tags.filter((tag: any) => tag.type === 'tag').map((tag: any) => `${tag.name} (${tag.count})`);

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`[${book.id}] ${book.title.japanese}`)
    .setURL(res.data.source)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(book.title.english ? book.title.english : 'No optional names.')
    .setThumbnail(NHentaiConstants.NHENTAI_LOGO)
    .addFields(
      { name: 'Parodies', value: parodies.length > 0 ? parodies.join('\n') : 'original' },
      { name: 'Characters', value: characters.length > 0 ? characters.join(', ') : 'original' },
      { name: 'Artists', value: artists.length > 0 ? artists?.join(', ') : 'N/A' },
      { name: 'Tags', value: tags.map((tag: string) => `\`${tag}\``).join(', ') },
      { name: 'Favorites', value: book.num_favorites.toString(), inline: true },
      { name: 'Pages count', value: book.num_pages.toString(), inline: true },
      { name: 'Language', value: book.lang, inline: true },
    )
    .setImage(book.images.cover.t)
    .setTimestamp()
    .addFields({
      name: 'Upload time',
      value: `${datetimeConverter(Math.floor(parseInt(book.upload_time) / 1000)).datetime}`,
    })
    .setFooter({ text: 'NHentai', iconURL: NHentaiConstants.NHENTAI_LOGO });
};
