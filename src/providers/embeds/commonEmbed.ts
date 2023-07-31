import type { GuildMember, User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { Client } from 'discordx';
import { CommonConstants } from '../../constants/index.js';
import { IUserQuote } from '../../types/quote.js';
import { datetimeConverter, tableConverter, timeDiff } from '../../utils/index.js';

export const UserInfoEmbed = (author: User, client: Client, user: GuildMember): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(CommonConstants.DEFAULT_EMBED_COLOR)
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
    .setFooter({ text: 'Xiaomi3K', iconURL: client.user!.displayAvatarURL() });
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

  const columnConfigs: Array<any> = [{ alignment: 'left' }, { alignment: 'right' }, { alignment: 'right' }];

  return (
    new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Server quotes list')
      .setAuthor({
        name: `${author.username}#${author.discriminator}`,
        iconURL: author.displayAvatarURL(),
      })
      .setDescription(`\`${tableConverter(list, columnConfigs)}\``)
      // .setDescription(tableConverter(list))
      // .setThumbnail()
      // .addFields({})
      .setTimestamp()
      .setFooter({ text: `Xiaomi3K (${page}/${total})`, iconURL: client.user!.displayAvatarURL() })
  );
};

export const MathEmbed = (expression: string, result: string, client: Client): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle('Calculated result')
    .addFields({ name: 'Expression', value: `\`\`\`${expression}\`\`\`` })
    .addFields({ name: 'Result', value: `\`\`\`${result}\`\`\`` })
    .setTimestamp()
    .setFooter({ text: 'Xiaomi3K', iconURL: client.user!.displayAvatarURL() });
};

export const CurrencyExchangeEmbed = (
  from: string,
  to: string,
  amount: number,
  result: number,
  client: Client,
): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .addFields({ name: `From ${from.toUpperCase()}`, value: `\`\`\`${amount.toLocaleString()}\`\`\`` })
    .addFields({ name: `To ${to.toUpperCase()}`, value: `\`\`\`${result.toLocaleString()}\`\`\`` })
    .setTimestamp()
    .setFooter({ text: 'Xiaomi3K', iconURL: client.user!.displayAvatarURL() });
};
