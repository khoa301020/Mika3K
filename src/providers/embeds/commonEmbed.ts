import type { GuildMember, User } from 'discord.js';
import { DiscordAPIError, EmbedBuilder } from 'discord.js';
import { CommonConstants } from '../../constants/index.js';
import { bot } from '../../main.js';
import { ICurrencyExchange } from '../../types/common.js';
import { IUserQuote } from '../../types/quote.js';
import { datetimeConverter, tableConverter, timeDiff } from '../../utils/index.js';

export const ErrorLogEmbed = (error: Error): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setColor(error instanceof DiscordAPIError ? 0x0099ff : 0xff0000)
    .setTitle('Error')
    .addFields({ name: 'Name', value: error.name }, { name: 'Message', value: error.message })
    .addFields()
    .setTimestamp()
    .setFooter({ text: 'Xiaomi3K', iconURL: bot.user!.displayAvatarURL() });

  if (error instanceof DiscordAPIError)
    embed.addFields(
      { name: 'Code', value: error.code.toString(), inline: true },
      { name: 'Method', value: error.method, inline: true },
    );

  embed.addFields({ name: 'Stack', value: `\`\`\`${error.stack}\`\`\`` });

  return embed;
};

export const UserInfoEmbed = (author: User, user: GuildMember): EmbedBuilder => {
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
    .setFooter({ text: 'Xiaomi3K', iconURL: bot.user!.displayAvatarURL() });
};

export const ListQuoteEmbed = (author: User, quotes: Array<IUserQuote>, page: Number, total: Number): EmbedBuilder => {
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
      .setFooter({ text: `Xiaomi3K (${page}/${total})`, iconURL: bot.user!.displayAvatarURL() })
  );
};

export const MathEmbed = (expression: string, result: string): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle('Calculated result')
    .addFields({ name: 'Expression', value: `\`\`\`${expression}\`\`\`` })
    .addFields({ name: 'Result', value: `\`\`\`${result}\`\`\`` })
    .setTimestamp()
    .setFooter({ text: 'Xiaomi3K', iconURL: bot.user!.displayAvatarURL() });
};

export const CurrencyExchangeEmbed = (
  from: string,
  to: string,
  amount: number,
  exchangeRes: ICurrencyExchange,
): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .addFields({ name: `From ${from.toUpperCase()}`, value: `\`\`\`${amount.toLocaleString()}\`\`\`` })
    .addFields({ name: `To ${to.toUpperCase()}`, value: `\`\`\`${exchangeRes.result.toLocaleString()}\`\`\`` })
    .setTimestamp()
    .setFooter({ text: 'Xiaomi3K', iconURL: bot.user!.displayAvatarURL() });

  if (amount > 1)
    embed.setTitle(`Rate: 1 ${from.toUpperCase()} = ${exchangeRes.rate.toLocaleString()} ${to.toUpperCase()}`);

  return embed;
};
