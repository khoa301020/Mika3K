import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from 'discord.js';
import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
  SlashOption,
} from 'discordx';
import { UserInfoEmbed } from '../providers/embeds/commonEmbed.js';

@Discord()
class CheckInfo {
  @SimpleCommand({ aliases: ['info', 'userinfo'], description: 'Check info' })
  infocommand(
    @SimpleCommandOption({ name: 'num1', type: SimpleCommandOptionType.User })
    user: GuildMember | undefined,
    command: SimpleCommandMessage,
  ): void {
    if (!user) user = command.message.guild!.members.cache.get(command.message.author.id);

    const embed = UserInfoEmbed(command.message.author, command.message.client.user, user);

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

    const embed = UserInfoEmbed(interaction.user, interaction.client.user, user);

    interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
