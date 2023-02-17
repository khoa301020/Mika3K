import type { GuildMember, User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { datetimeConverter, timeDiff } from '../../helpers/index.js';

export const UserInfoEmbed = (author: User, client: User, user?: GuildMember): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`${user?.user.username}#${user?.user.discriminator}`)
    .setURL(`https://discordapp.com/users/${user?.id}`)
    .setAuthor({
      name: `${author.username}#${author.discriminator}`,
      iconURL: author.displayAvatarURL(),
    })
    .setDescription(`${user?.nickname ? `${user?.nickname}#${user?.user.discriminator}` : 'No nickame'}`)
    .setThumbnail(user?.displayAvatarURL() ?? null)
    .addFields({ name: 'ID', value: `${user?.id}` })
    .addFields({
      name: 'Roles',
      value: `${user?.roles.cache
        .filter((role) => role.name !== '@everyone')
        .map((role) => role)
        .join(', ')}`,
    })
    .addFields(
      {
        name: 'Booster since',
        value: user?.premiumSince
          ? `${datetimeConverter(user?.premiumSince!).date} (${timeDiff(user?.premiumSince!)})`
          : 'No boosting',
        inline: true,
      },
      {
        name: 'Join day',
        value: `${datetimeConverter(user?.joinedAt!).date} (${timeDiff(user?.joinedAt!)})`,
        inline: true,
      },
    )
    .setTimestamp()
    .setFooter({ text: 'Xiaomi3K', iconURL: client.displayAvatarURL() });
};
