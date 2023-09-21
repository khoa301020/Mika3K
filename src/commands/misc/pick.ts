import { Message } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage } from 'discordx';
import { editOrReplyThenDelete, randomArray } from '../../utils/index.js';

@Discord()
class Pick {
  @SimpleCommand({ aliases: ['p', 'pick'], description: 'Pick random option(s)' })
  async pickcommand(command: SimpleCommandMessage): Promise<Message<boolean> | void> {
    const args = command.argString.match(/(\d+\s+)?(.+)/);
    const amount = args && args[1] ? parseInt(args[1]) : 1;
    const options = args && args[2] ? args[2].split(',').filter((x) => x) : [];
    if (amount < 1 || amount > options.length)
      return await editOrReplyThenDelete(command.message, '❌ Invalid arguments');
    if (options.length < 2) return await editOrReplyThenDelete(command.message, '❌ Please provide at least 2 options');

    const result = randomArray(options, amount);
    return await command.message.reply(
      `I pick ${new Intl.ListFormat('en-GB').format(result.map((r) => `**${r.trim()}**`))}`,
    );
  }
}
