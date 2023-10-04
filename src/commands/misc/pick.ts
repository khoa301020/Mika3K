import { Message } from 'discord.js';
import { Discord, SimpleCommand, SimpleCommandMessage } from 'discordx';
import { editOrReplyThenDelete, getRandomInteger, randomArray } from '../../utils/index.js';

@Discord()
class Pick {
  @SimpleCommand({ aliases: ['p', 'pick'], description: 'Pick random option(s)' })
  async pickcommand(command: SimpleCommandMessage): Promise<Message<boolean> | void> {
    const args = command.argString.match(/(\d+\s+)?(.+)/); // match amount and options
    const amount = args && args[1] ? parseInt(args[1]) : 1; // default amount is 1
    const options = args && args[2] ? args[2].split(',').filter((x) => x) : []; // remove empty options
    const range = options.map((x) => x.match(/(-?\d+)\s*-\s*(-?\d+)/)).filter((x) => x); // match range including minus 0 number

    if (amount < 1 || amount > options.length) // amount must be greater than 0 and less than or equal to options length
      return await editOrReplyThenDelete(command.message, '❌ Invalid arguments');
    if (options.length < 2 && !range) editOrReplyThenDelete(command.message, '❌ Please provide at least 2 options');

    let result;

    // if range is provided, pick random number from range, regardless of amount
    if (range && range.length > 0) {
      // filter invalid range
      result = range.filter((x) => x && x.length === 3).map((x) => {
        let start = parseInt(x![1]);
        let end = parseInt(x![2]);
        if (start > end) [start, end] = [end, start]; // swap start and end if start is greater than end
        return `${getRandomInteger(start, end)}`;
      });
    } else {
      result = randomArray(options, amount);
    }

    return await command.message.reply(
      `I pick ${new Intl.ListFormat('en-GB').format(result.map((r) => `**${r.trim()}**`))}`,
    );
  }
}
