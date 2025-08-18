import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { AttachmentBuilder, Message, MessagePayload, MessageReplyOptions } from 'discord.js';
import { ArgsOf, Discord, On } from 'discordx';
import { CommonConstants } from '../constants/index.js';
import { FxSnsEmbed } from '../providers/embeds/FxSnsEmbed.js';
import { IFxTiktokResponse, MediaAttachment } from '../types/fxtiktok.js';
import { IFxEmbed } from '../types/snsEmbed.js';
import { checkVideoSize, discordTimestamp, editOrReplyThenDelete, isTextBasedChannel } from '../utils/index.js';

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
    if (message.author.bot) return;

    let url =
      message.content.match(CommonConstants.TIKTOK_URL_REGEX)?.shift() ??
      message.content.match(CommonConstants.TIKTOK_SHORT_URL_REGEX)?.shift() ??
      '';

    if (!url) return;

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

    if (!url || !RegExp(CommonConstants.TIKTOK_URL_REGEX).test(url))
      return await fetchFailed(message, 'Invalid Tiktok URL');

    const postId = url.match(CommonConstants.TIKTOK_ID_REGEX)?.[1];

    if (!postId)
      return await fetchFailed(message, 'Invalid Tiktok URL (post ID not found)');

    const post: IFxTiktokResponse = (await axios.get(CommonConstants.FXTIKTOK_API(postId))).data;

    if (!post)
      return await fetchFailed(message, 'Tiktok post not found');

    if (post.visibility !== 'public')
      return await fetchFailed(message, 'Tiktok post is not public');

    await message.suppressEmbeds(true);

    let videos: AttachmentBuilder[] = [];
    let videoSizeLimitFlag = 0;

    const imageUrls: string[] = post.media_attachments.map((media: MediaAttachment) => media.url);
    const videoUrl: string | undefined = post.media_attachments.find((media: MediaAttachment) => media.type === 'video')?.url;

    if (videoUrl) {
      const videoSizeLimit = CommonConstants.DISCORD_PERKS[message.guild?.premiumTier || 0].uploadLimit;
      const videoSize = await checkVideoSize(videoUrl); // Tiktok videos are usually single
      const videoAttachment = videoSize <= videoSizeLimit ? new AttachmentBuilder(videoUrl) : null;

      if (!videoAttachment) {
        videoSizeLimitFlag++;
      } else {
        videoAttachment.setName(`tiktok-${postId}.mp4`);
        videos.push(videoAttachment);
      }
    }

    const convertedData: Partial<IFxEmbed> = convertToEmbed(post);
    convertedData.images = imageUrls;

    FxSnsEmbed(convertedData as IFxEmbed).forEach(async (embeds, index) => {
      const msg: MessagePayload | MessageReplyOptions = {
        content: videoSizeLimitFlag > 0 && !index ? '⚠️ Video size exceeds Discord limit, not included.' : '',
        embeds: embeds,
        allowedMentions: { repliedUser: false },
        files: videos
      };
      await message.reply(msg);
    })
  }
}

async function fetchFailed(message: Message, content: string): Promise<void> {
  return await editOrReplyThenDelete(message, {
    content,
    allowedMentions: { repliedUser: false },
  });
}

function convertToEmbed(post: IFxTiktokResponse): Partial<IFxEmbed> {
  const $ = cheerio.load(post.content);
  const stats = $('b').text().trim();

  $('b, br').remove();
  const content = $('body').text().trim();

  return {
    themeColor: 0x69c9d0, // Tiktok brand color
    url: post.url,
    author: {
      name: `${post.account.display_name} (@${post.account.username})${post.account.locked ? ' 🔒' : ''}`,
      url: post.account.url,
    },
    thumbnail: post.account.avatar_static,
    title: `${stats} 🕑 ${discordTimestamp(dayjs(post.created_at).unix(), 'RELATIVE_TIME')}`,
    description: content,
    icon: CommonConstants.TIKTOK_LOGO
  }
}