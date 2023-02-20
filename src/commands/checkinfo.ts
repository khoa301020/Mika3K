import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CommandInteraction,
  GuildMember,
  MessageContextMenuCommandInteraction,
} from 'discord.js';
import {
  ContextMenu,
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
  @SimpleCommand({ aliases: ['info', 'userinfo'], description: 'Check user info' })
  infocommand(
    @SimpleCommandOption({ name: 'num1', type: SimpleCommandOptionType.User })
    user: GuildMember | undefined,
    command: SimpleCommandMessage,
  ): void {
    if (!user) user = command.message.guild!.members.cache.get(command.message.author.id);

    const embed = UserInfoEmbed(command.message.author, command.message.client.user, user!);

    command.message.reply({ embeds: [embed] });
  }

  @Slash({ description: 'Check user info', name: 'check-info' })
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

    const embed = UserInfoEmbed(interaction.user, interaction.client.user, user!);

    interaction.reply({ embeds: [embed], ephemeral: true });
  }

  @ContextMenu({
    name: 'Check user info',
    type: ApplicationCommandType.User,
  })
  messageHandler(interaction: MessageContextMenuCommandInteraction): void {
    const user = interaction.guild!.members.cache.get(interaction.targetId);

    const embed = UserInfoEmbed(interaction.user, interaction.client.user, user!);
    interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
