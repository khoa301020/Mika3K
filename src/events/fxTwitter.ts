import axios from 'axios';
import * as cheerio from 'cheerio';
import { AttachmentBuilder, ChannelType, MessagePayload, MessageReplyOptions } from 'discord.js';
import { ArgsOf, Discord, On } from 'discordx';
import qs from 'qs';
import { CommonConstants } from '../constants/index.js';
import { FxTwitterEmbed } from '../providers/embeds/fxTwitterEmbed.js';
import { IFxTweet } from '../types/twitter.js';

@Discord()
export class FxTwitterEvents {
  /**
   * Twitter embed
   *
   * @param {ArgsOf<'messageCreate'>} [message]
   * @memberof FxTwitterEvents
   *
   */
  @On({ event: 'messageCreate' })
  async FxTwitter([message]: ArgsOf<'messageCreate'>): Promise<void> {
    if (message.channel.type !== ChannelType.GuildText) return;
    if (!message.content.match(CommonConstants.TWITTER_URL_REGEX)?.length) return;
    const matches = message.content.match(CommonConstants.TWITTER_URL_REGEX)?.map((match) =>
      match
        .replace('twitter.com', 'fxtwitter.com')
        .replace('x.com', 'fixupx.com')
        .replace(/^(?!https?:\/\/)/, 'https://'),
    );

    if (!matches || message.embeds.length > 0) return;

    message.channel.sendTyping();
    let tweets: Array<IFxTweet> = [];

    for (const url of matches) {
      tweets.push(
        await axios
          .get(url, {
            headers: {
              'User-Agent': CommonConstants.BOT_USER_AGENT,
            },
          })
          .then((res) => {
            const $ = cheerio.load(res.data);
            const oembed = qs.parse($('link[rel="alternate"]').attr('href')!.split('?')[1]);
            const tweet: IFxTweet = {
              url: $('meta[property="og:url"]').attr('content')!,
              title: decodeURIComponent(oembed.provider ? oembed.provider.toString() : oembed.text?.toString()!),
              author: {
                name:
                  $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content')!,
                url: $('meta[property="og:url"]').attr('content')!.split('/status')[0],
              },
              themeColor:
                Number($('meta[property="theme-color"]').attr('content')?.replace('#', '0x')) ||
                CommonConstants.DEFAULT_EMBED_COLOR,
              description: $('meta[property="og:description"]').attr('content') || '',
              image:
                $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '',
            };

            if ($('meta[property="og:video"]').attr('content'))
              tweet.video = {
                url: $('meta[property="og:video:secure_url"]').attr('content')!,
                width: parseInt($('meta[property="og:video:width"]').attr('content')!),
                height: parseInt($('meta[property="og:video:height"]').attr('content')!),
              };

            return tweet;
          }),
      );
    }

    await message.suppressEmbeds(true);

    const replyMessages = tweets.map((tweet) => {
      const msg: string | MessagePayload | MessageReplyOptions = {
        embeds: [FxTwitterEmbed(tweet)],
        allowedMentions: { repliedUser: false },
        files: [],
      };

      if (tweet.video) {
        msg.files!.push(new AttachmentBuilder(tweet.video.url!));
      }

      return msg;
    });

    return replyMessages.forEach(async (replyMessage) => {
      await message.reply(replyMessage);
    });
  }
}
