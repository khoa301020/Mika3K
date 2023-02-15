import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
  SlashOption,
} from 'discordx';
import { datetimeConverter, timeDiff } from '../helpers/index.js';

let config = {
  headers: {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    cookie: `cf_clearance=${process.env.COOKIE}`,
  },
};

@Discord()
class CheckInfo {
  @SimpleCommand({ aliases: ['info', 'userinfo'], description: 'Check info' })
  infocommand(
    @SimpleCommandOption({ name: 'num1', type: SimpleCommandOptionType.User })
    user: GuildMember | undefined,
    command: SimpleCommandMessage,
  ): void {
    if (!user) user = command.message.guild!.members.cache.get(command.message.author.id);

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`${user?.user.username}#${user?.user.discriminator}`)
      .setURL(`https://discordapp.com/users/${user?.id}`)
      .setAuthor({
        name: `${command.message.author.username}#${command.message.author.discriminator}`,
        iconURL: command.message.author.displayAvatarURL(),
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
      .setFooter({ text: 'Xiaomi3K', iconURL: command.message.client.user.displayAvatarURL() });
    command.message.reply({ embeds: [embed] });
  }

  @Slash({ description: 'Check info', name: 'check-info' })
  async infoslash(
    @SlashOption({
      description: 'User to check',
      name: 'user',
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember | undefined,
    interaction: CommandInteraction,
  ): Promise<void> {
    if (!user) user = interaction.guild!.members.cache.get(interaction.user.id);

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`${user?.user.username}#${user?.user.discriminator}`)
      .setURL(`https://discordapp.com/users/${user?.id}`)
      .setAuthor({
        name: `${interaction.user.username}#${interaction.user.discriminator}`,
        iconURL: interaction.user.displayAvatarURL(),
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
      .setFooter({ text: 'Xiaomi3K', iconURL: interaction.client.user.displayAvatarURL() });
    interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
