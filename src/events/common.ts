// import type { ArgsOf, Client } from 'discordx';
import { createHash } from 'crypto';
import { ArgsOf, Client, Discord, On, RestArgsOf } from 'discordx';
import { cache } from '../main.js';

@Discord()
export class CommonEvents {
  @On({ event: 'messageCreate' })
  PingPong([message]: ArgsOf<'messageCreate'>, client: Client): void {
    if (message.content === 'ping') {
      message.channel.send('pong');
    }
  }

  @On({ event: 'messageCreate' })
  FollowUp([message]: ArgsOf<'messageCreate'>, client: Client): void | boolean | number {
    if (message.author.bot) return;
    if (message.content.length >= 100) return;
    const cachedChannel: Array<string> | undefined = cache.get(`followup${message.channelId}`);
    const msgHashed = createHash('sha1').update(`${message.content}`).digest('hex');
    if (cachedChannel && cachedChannel?.length >= 1 && cachedChannel.includes(msgHashed)) {
      if (cachedChannel.length >= 2) {
        message.channel.send(message.content);
        return cache.del(`followup${message.channelId}`);
      } else {
        cachedChannel.push(msgHashed);
        return cache.set(`followup${message.channelId}`, cachedChannel, 60 * 60 * 24);
      }
    } else {
      return cache.set(`followup${message.channelId}`, [msgHashed], 60 * 60 * 24);
    }
  }

  @On.rest()
  rateLimited([data]: RestArgsOf<'rateLimited'>): void {
    console.log(`Rate limited for ${data.url}, reset at ${data.timeToReset}`);
  }
}
