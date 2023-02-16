import type { AxiosResponse } from 'axios';
import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { Constants } from '../constants/constants';

export const NHentaiBookEmbed = (res: AxiosResponse, author: User): EmbedBuilder => {
  const book = res.data.data;

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(book.title)
    .setURL(res.data.source)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(book.optional_title ? book.optional_title.english : 'No optional names.')
    .setThumbnail(Constants.NHENTAI_LOGO)
    .addFields(
      { name: 'Parodies', value: book.parodies ? book.parodies : 'original' },
      { name: 'Characters', value: book.characters.length > 0 ? book.characters.join(', ') : 'original' },
      { name: 'Artists', value: book.artist?.join(', ') },
      { name: 'Tags', value: book.tags.map((tag: string) => `\`${tag}\``).join(', ') },
      { name: 'Favorites', value: book.num_favorites.toString(), inline: true },
      { name: 'Pages count', value: book.num_pages.toString(), inline: true },
      { name: 'Language', value: book.language, inline: true },
    )
    .setImage(book.image[0])
    .setTimestamp()
    .addFields({ name: 'Upload date', value: book.upload_date })
    .setFooter({ text: 'NHentai', iconURL: Constants.NHENTAI_LOGO });
};
