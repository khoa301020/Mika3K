import axios from 'axios';
import * as cheerio from 'cheerio';
import { AttachmentBuilder, ChannelType, MessagePayload, MessageReplyOptions } from 'discord.js';
import { ArgsOf, Discord, On } from 'discordx';
import qs from 'qs';
import { CommonConstants } from '../constants/index.js';
import { FxSnsEmbed } from '../providers/embeds/FxSnsEmbed.js';
import { IFxEmbed } from '../types/snsEmbed';
import { isTextBasedChannel } from '../utils/index.js';

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
    if (!isTextBasedChannel(message.channel.type)) return;
    if (!message.content.match(CommonConstants.TWITTER_URL_REGEX)?.length) return;
    const url = message.content.match(CommonConstants.TWITTER_URL_REGEX)?.map((match) =>
      match
        .replace('twitter.com', 'fxtwitter.com')
        .replace('x.com', 'fixupx.com')
        .replace(/^(?!https?:\/\/)/, 'https://'),
    ).shift();

    if (!url) return;

    message.channel.sendTyping();
    const tweet =
      await axios
        .get(url, {
          headers: {
            'User-Agent': CommonConstants.BOT_USER_AGENT,
          },
        })
        .then((res) => {
          const $ = cheerio.load(res.data);
          const oembed = qs.parse($('link[rel="alternate"]').attr('href')!.split('?')[1]);
          const tweet: IFxEmbed = {
            source: 'Twitter/X',
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
            icon: CommonConstants.TWITTER_LOGO,
          };

          if ($('meta[property="og:video"]').attr('content'))
            tweet.video = {
              url: $('meta[property="og:video:secure_url"]').attr('content')!,
              width: parseInt($('meta[property="og:video:width"]').attr('content')!),
              height: parseInt($('meta[property="og:video:height"]').attr('content')!),
            };

          return tweet;
        }).catch(() => null);

    if (!tweet) return;

    await message.suppressEmbeds(true);

    const msg: string | MessagePayload | MessageReplyOptions = {
      embeds: [FxSnsEmbed(tweet)],
      allowedMentions: { repliedUser: false },
      files: [],
    };

    if (tweet.video) {
      msg.files!.push(new AttachmentBuilder(tweet.video.url!));
    }

    await message.reply(msg);
  }
}
