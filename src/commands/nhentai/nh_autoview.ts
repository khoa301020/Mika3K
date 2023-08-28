import { ChannelType } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage, SimpleCommandOption, SimpleCommandOptionType } from 'discordx';
import CommonConstants from '../../constants/common.js';
import NotifyChannel from '../../models/NotifyChannel.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
export class NHentai {
  @SimpleCommand({ aliases: ['nha', 'nhautoview'], description: 'Set on/off Autoview code', argSplitter: ' ' })
  async NHentaiAutoview(
    @SimpleCommandOption({ name: 'action', type: SimpleCommandOptionType.String })
    action: 'on' | 'off',
    command: SimpleCommandMessage,
  ): Promise<any> {
    if (command.message.author.id !== process.env.OWNER_ID)
      return editOrReplyThenDelete(command.message, '❌ Only the bot owner can use this command');
    if (command.message.channel.type !== ChannelType.GuildText)
      return editOrReplyThenDelete(command.message, '❌ This command is only available in guilds text channels.');

    if (!command.message.channel.nsfw)
      return editOrReplyThenDelete(command.message, '❌ This command is only available in NSFW channels.');

    if (!action) return editOrReplyThenDelete(command.message, '❌ Invalid arguments. Usage: `nhautoview <on|off>`');

    if (action === 'on') {
      return NotifyChannel.findOneAndUpdate(
        {
          channelId: command.message.channelId,
        },
        {
          guildId: command.message.guildId,
          channelId: command.message.channelId,
          notifyType: CommonConstants.NOTIFY_TYPE.NHENTAI_AUTOVIEW,
        },
        {
          upsert: true,
        },
      ).then(() => editOrReplyThenDelete(command.message, '✅ NHentai Autoview **ON**'));
    } else if (action === 'off') {
      return NotifyChannel.deleteOne({
        channelId: command.message.channelId,
        notifyType: CommonConstants.NOTIFY_TYPE.NHENTAI_AUTOVIEW,
      }).then(() => editOrReplyThenDelete(command.message, '✅ NHentai Autoview **OFF**'));
    }
  }
}
