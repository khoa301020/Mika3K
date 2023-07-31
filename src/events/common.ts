// import type { ArgsOf, Client } from 'discordx';
import { ArgsOf, Client, Discord, On } from 'discordx';

@Discord()
export class CommonEvents {
  /**
   * Ping pong
   *
   * @param {ArgsOf<'messageCreate'>} [message]
   * @param {Client} client
   * @memberof CommonEvents
   *
   */
  @On({ event: 'messageCreate' })
  PingPong([message]: ArgsOf<'messageCreate'>, client: Client): void {
    if (message.content.toLowerCase() === 'ping') {
      message.channel.send(`pong! \nLatency: ${Date.now() - message.createdTimestamp}ms.`);
    }
  }

  /**
   *  Follow up message (disabled because don't know how to ignore other bot call)
   *
   * @param {ArgsOf<'messageCreate'>} [message]
   * @param {Client} client
   * @memberof CommonEvents
   * @disabed
   */
  // @On({ event: 'messageCreate' })
  // FollowUp([message]: ArgsOf<'messageCreate'>, client: Client): void | boolean | number {
  //   if (message.author.bot) return;
  //   if (message.content.length >= 100) return;
  //   const cachedChannel: Array<string> | undefined = cache.get(`followup${message.channelId}`);
  //   const msgHashed = createHash('sha1').update(`${message.content}`).digest('hex');
  //   if (cachedChannel && cachedChannel?.length >= 1 && cachedChannel.includes(msgHashed)) {
  //     if (cachedChannel.length >= 2) {
  //       message.channel.send(message.content);
  //       return cache.del(`followup${message.channelId}`);
  //     } else {
  //       cachedChannel.push(msgHashed);
  //       return cache.set(`followup${message.channelId}`, cachedChannel, 60 * 60 * 24);
  //     }
  //   } else {
  //     return cache.set(`followup${message.channelId}`, [msgHashed], 60 * 60 * 24);
  //   }
  // }
}
