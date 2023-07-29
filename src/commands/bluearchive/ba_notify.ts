import { Discord, SimpleCommand, SimpleCommandMessage, SimpleCommandOption, SimpleCommandOptionType } from 'discordx';
import NotifyChannel from '../../models/NotifyChannel.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
export class BlueArchiveSync {
  @SimpleCommand({ aliases: ['nt', 'notify'], description: 'Notify', argSplitter: ' ' })
  async BAChannelNotify(
    @SimpleCommandOption({ name: 'action', type: SimpleCommandOptionType.String })
    action: 'add' | 'remove',
    command: SimpleCommandMessage,
  ): Promise<any> {
    if (command.message.author.id !== process.env.OWNER_ID)
      return editOrReplyThenDelete(command.message, '❌ Only the bot owner can use this command');

    if (!action) return editOrReplyThenDelete(command.message, '❌ Invalid arguments');

    if (action === 'add') {
      return NotifyChannel.findOneAndUpdate(
        {
          channelId: command.message.channelId,
        },
        {
          guildId: command.message.guildId,
          channelId: command.message.channelId,
          notifyType: 'Blue Archive',
        },
        {
          upsert: true,
        },
      ).then(() => editOrReplyThenDelete(command.message, 'Notify channel added'));
    } else if (action === 'remove') {
      return NotifyChannel.deleteOne({
        channelId: command.message.channelId,
      }).then(() => editOrReplyThenDelete(command.message, 'Notify channel removed'));
    }
  }
}
