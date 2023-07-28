import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CommandInteraction,
  GuildMember,
  Message,
  UserContextMenuCommandInteraction,
} from 'discord.js';
import {
  Client,
  ContextMenu,
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
  SlashOption,
} from 'discordx';
import { UserInfoEmbed } from '../../providers/embeds/commonEmbed.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
class CheckInfo {
  @SimpleCommand({ aliases: ['info', 'userinfo'], description: 'Check user info' })
  async infocommand(
    @SimpleCommandOption({ name: 'user', type: SimpleCommandOptionType.User })
    user: GuildMember | undefined,
    command: SimpleCommandMessage,
  ): Promise<Message<boolean> | void> {
    if (!user) user = command.message.guild!.members.cache.get(command.message.author.id);
    if (!user?.id) return editOrReplyThenDelete(command.message, { content: '❌ Invalid user' });

    const embed = UserInfoEmbed(command.message.author, command.message.client as Client, user!);

    return command.message.reply({ embeds: [embed] });
  }

  @Slash({ description: 'Check user info', name: 'check-info' })
  infoslash(
    @SlashOption({
      description: 'User to check',
      name: 'user',
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember | undefined,
    interaction: CommandInteraction,
  ): void {
    if (!user) user = interaction.guild!.members.cache.get(interaction.user.id);

    const embed = UserInfoEmbed(interaction.user, interaction.client as Client, user!);

    interaction.reply({ embeds: [embed], ephemeral: true });
  }

  @ContextMenu({
    name: 'Check user info',
    type: ApplicationCommandType.User,
  })
  messageHandler(interaction: UserContextMenuCommandInteraction): void {
    const user = interaction.guild!.members.cache.get(interaction.targetId);

    const embed = UserInfoEmbed(interaction.user, interaction.client as Client, user!);
    interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
