import type { GuildMember, User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { Client } from 'discordx';
import { datetimeConverter, tableConverter, timeDiff } from '../../helpers/helper.js';
import { IUserQuote } from '../../types/quote.js';

export const UserInfoEmbed = (author: User, client: User, user: GuildMember): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`${user.user.username}#${user.user.discriminator}`)
    .setURL(`https://discordapp.com/users/${user.id}`)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`${user.nickname ? `${user.nickname}#${user.user.discriminator}` : 'No nickame'}`)
    .setThumbnail(user.displayAvatarURL() ?? null)
    .addFields({ name: 'ID', value: `${user.id}` })
    .addFields({
      name: 'Roles',
      value: `${user.roles.cache
        .filter((role) => role.name !== '@everyone')
        .map((role) => role)
        .join(', ')}`,
    })
    .addFields(
      {
        name: 'Create day',
        value: `${datetimeConverter(user.user.createdAt!).date} (${timeDiff(user.user.createdAt!)})`,
        inline: true,
      },
      {
        name: 'Join day',
        value: `${datetimeConverter(user.joinedAt!).date} (${timeDiff(user.joinedAt!)})`,
        inline: true,
      },
    )
    .addFields({
      name: 'Booster since',
      value: user.premiumSince
        ? `${datetimeConverter(user.premiumSince!).date} (${timeDiff(user.premiumSince!)})`
        : 'No boosting',
    })
    .setTimestamp()
    .setFooter({ text: 'Xiaomi3K', iconURL: client.displayAvatarURL() });
};

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
