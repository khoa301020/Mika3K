import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { Client } from 'discordx';
import { tableConverter } from '../../helpers/helper.js';
import { IUserQuote } from '../../types/quote.js';

export const ListQuoteEmbed = (
  author: User,
  client: Client,
  quotes: Array<IUserQuote>,
  page: Number,
  total: Number,
): EmbedBuilder => {
  let list = quotes.map((quote: IUserQuote) =>
    Object({
      id: quote._id,
      keyword: quote.quote.key,
      author: quote.user,
    }),
  );

  return (
    new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Server quotes list')
      .setAuthor({
        name: `${author.username}#${author.discriminator}`,
        iconURL: author.displayAvatarURL(),
      })
      .setDescription(`\`${tableConverter(list)}\``)
      // .setDescription(tableConverter(list))
      // .setThumbnail()
      // .addFields({})
      .setTimestamp()
      .setFooter({ text: `Xiaomi3K (${page}/${total})`, iconURL: client.user!.displayAvatarURL() })
  );
};
