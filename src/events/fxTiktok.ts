import axios from 'axios';
import * as cheerio from 'cheerio';
import { AttachmentBuilder, MessagePayload, MessageReplyOptions } from 'discord.js';
import { ArgsOf, Discord, On } from 'discordx';
import qs from 'qs';
import { CommonConstants } from '../constants/index.js';
import { FxSnsEmbed } from '../providers/embeds/FxSnsEmbed.js';
import { IFxEmbed } from '../types/snsEmbed.js';
import { isTextBasedChannel } from '../utils/index.js';

@Discord()
export class FxTiktokEvents {
  /**
   * Tiktok embed
   *
   * @param {ArgsOf<'messageCreate'>} [message]
   * @memberof FxTiktokEvents
   *
   */
  @On({ event: 'messageCreate' })
  async FxTiktok([message]: ArgsOf<'messageCreate'>): Promise<void> {
    if (!isTextBasedChannel(message.channel.type)) return;
    if (
      !message.content.match(CommonConstants.TIKTOK_URL_REGEX)?.length &&
      !message.content.match(CommonConstants.TIKTOK_SHORT_URL_REGEX)?.length
    )
      return;

    let url =
      message.content.match(CommonConstants.TIKTOK_URL_REGEX)?.shift() ??
      message.content.match(CommonConstants.TIKTOK_SHORT_URL_REGEX)?.shift() ??
      '';

    await message.channel.sendTyping();

    if (RegExp(CommonConstants.TIKTOK_SHORT_URL_REGEX).test(url)) {
      url =
        (await axios
          .get(url, {
            headers: {
              'User-Agent': CommonConstants.BOT_USER_AGENT,
            },
          })
          .then((res) => cheerio.load(res.data)('meta[property="og:url"]').attr('content')?.split('?').shift())) ?? '';
    }

    const post = await axios
      .get(
        url
          .replace('tiktok.com', 'vxtiktok.com')
          .replace(/^(?!https?:\/\/)/, 'https://')
          .replace('/photo/', '/video/'),
        {
          headers: {
            'User-Agent': CommonConstants.BOT_USER_AGENT,
          },
        },
      )
      .then(async (res) => {
        const $ = cheerio.load(res.data);
        const oembed = qs.parse($('link[type="application/json+oembed"]').attr('href')!.split('?')[1]);
        const videoUrl = $('meta[property="og:video"]').attr('content')!;
        const post: IFxEmbed = {
          source: 'Tiktok',
          url: $('meta[property="og:url"]').attr('content')!,
          title: decodeURIComponent(oembed.provider ? oembed.provider.toString() : oembed.text?.toString()!),
          author: {
            name: $('meta[name="twitter:title"]').attr('content') || $('meta[name="tiktok:title"]').attr('content')!,
            url: $('meta[property="og:url"]').attr('content')!.split('/status')[0],
          },
          themeColor:
            Number($('meta[property="theme-color"]').attr('content')?.replace('#', '0x')) ||
            CommonConstants.DEFAULT_EMBED_COLOR,
          description: $('meta[property="og:description"]').attr('content') || '',
          image: $('meta[property="og:image"]').attr('content') || $('meta[name="tiktok:image"]').attr('content') || '',
          icon: CommonConstants.TIKTOK_LOGO,
        };

        if ($('meta[property="og:url"]').attr('content'))
          post.video = {
            url: videoUrl,
            width: parseInt($('meta[property="og:video:width"]').attr('content')!),
            height: parseInt($('meta[property="og:video:height"]').attr('content')!),
          };

        return post;
      }).catch(() => null);

    if (!post) return;

    await message.suppressEmbeds(true);

    const msg: string | MessagePayload | MessageReplyOptions = {
      embeds: [FxSnsEmbed(post)],
      allowedMentions: { repliedUser: false },
      files: [],
    };

    if (post.video)
      if (post.video.url.includes('slideshow.mp4')) {
        await axios.get(post.video.url, { headers: { 'User-Agent': CommonConstants.BOT_USER_AGENT } });
        msg.files!.push(new AttachmentBuilder(`https://renders.vxtiktok.com/${post.video.url.split('/').pop()}.mp4`));
      } else {
        const buffer = await axios.get(post.video.url, { responseType: 'arraybuffer' }).then((res) => res.data);
        msg.files!.push(new AttachmentBuilder(buffer, { name: 'video.mp4' }));
      }

    await message.reply(msg);
  }
}
