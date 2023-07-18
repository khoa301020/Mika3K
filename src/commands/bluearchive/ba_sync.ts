import { Discord, SimpleCommand, SimpleCommandMessage, SimpleCommandOption, SimpleCommandOptionType } from 'discordx';
import NotifyChannel from '../../models/NotifyChannel.js';

@Discord()
export class BlueArchiveSync {
  @SimpleCommand({ aliases: ['nt', 'notify'], description: 'Notify', argSplitter: ' ' })
  async syncAll(
    @SimpleCommandOption({ name: 'action', type: SimpleCommandOptionType.String })
    action: 'add' | 'remove',
    command: SimpleCommandMessage,
  ): Promise<any> {
    if (command.message.author.id !== process.env.OWNER_ID)
      return command.message.reply('Only the bot owner can use this command').then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 5000);
      });

    if (!action)
      return command.message.reply('Invalid arguments').then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 5000);
      });

    if (action === 'add') {
      return NotifyChannel.create({
        guildId: command.message.guildId,
        channelId: command.message.channelId,
        notifyType: 'Blue Archive',
      }).then(() => command.message.reply('Notify channel added'));
    } else if (action === 'remove') {
      return NotifyChannel.deleteOne({
        channelId: command.message.channelId,
      }).then(() => command.message.reply('Notify channel removed'));
    }
  }
}
