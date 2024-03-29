import { ChannelType, MessageReaction } from 'discord.js';
import { ArgsOf, Discord, On } from 'discordx';
import { CommonConstants, NHentaiConstants } from '../constants/index.js';
import NotifyChannel from '../models/NotifyChannel.js';
import { NHentaiEmbed } from '../providers/embeds/nhentaiEmbed.js';
import { simulateNHentaiRequest } from '../services/nhentai.js';
import { INHentai } from '../types/nhentai.js';
import { isTextBasedChannel, timeout } from '../utils/index.js';

@Discord()
export class NHentaiEvents {
  /**
   * NHentai autoview
   *
   * @param {ArgsOf<'messageCreate'>} [message]
   * @memberof NHentaiEvents
   *
   */
  @On({ event: 'messageCreate' })
  async NHentaiAutoview([message]: ArgsOf<'messageCreate'>): Promise<void | MessageReaction> {
    if (message.author.bot) return;
    if (!isTextBasedChannel(message.channel.type)) return;
    if (process.env.BOT_PREFIX && message.content.startsWith(process.env.BOT_PREFIX)) return;
    if (message.channel.type === ChannelType.GuildText && !message.channel.nsfw) return;

    let codes: Array<string> | null = message.content
      .replace(/<a?:.+?:\d+>/g, '') // remove all emojis
      .replace(/<@!?\d+>/g, '') // remove all mentions
      .replace(/https?:\/\/\S+/g, '') // remove all links (both http and https)
      .match(/(?<!\d)\d{6}(?!\d)/g); // match all 6 digits separated by space, comma, or newline

    if (!codes || codes.length === 0) return;

    const isChannelEnabled = await NotifyChannel.exists({
      channelId: message.channelId,
      notifyType: CommonConstants.NOTIFY_TYPE.NHENTAI_AUTOVIEW,
    });

    if (!isChannelEnabled) return;

    codes = [...new Set(codes)].slice(0, CommonConstants.EMBED_LIMIT_PER_MESSAGE); // remove duplicates and limit to max embed per message

    let results: Array<INHentai> = [];
    try {
      message.channel.sendTyping();
      for (const code of codes) {
        const data = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_GALLERY_ENDPOINT(code));
        if (!data) continue;
        results.push(data);
        await timeout(3333);
      }
    } catch (err: any) {
      await message.react('❌');
      throw err;
    }

    if (results.length === 0) return await message.react('❌');

    const embeds = results.map((result) => NHentaiEmbed(result, message.author));

    await message.reply({
      embeds: [...embeds],
      allowedMentions: { repliedUser: false },
    });
  }
}
