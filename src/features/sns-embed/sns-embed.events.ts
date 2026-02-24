import { Injectable, Logger } from '@nestjs/common';
import { Context, On } from 'necord';
import type { ContextOf } from 'necord';
import {
  AttachmentBuilder,
  ChannelType,
  Client,
  MessageReplyOptions,
} from 'discord.js';
import { AppHttpService } from '../../shared/http';
import { SnsEmbedConstants } from './sns-embed.constants';
import { FxSnsEmbed } from './sns-embed.embeds';
import { IFxEmbed, TEmbedType } from './types';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function discordTimestamp(unix: number, style: string): string {
  const styleMap: Record<string, string> = {
    RELATIVE_TIME: 'R',
    SHORT_DATE: 'd',
    LONG_DATE: 'D',
  };
  return `<t:${unix}:${styleMap[style] || 'R'}>`;
}

async function checkVideoSize(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return parseInt(res.headers.get('content-length') || '0', 10);
  } catch {
    return Infinity;
  }
}

@Injectable()
export class SnsEmbedEvents {
  private readonly logger = new Logger(SnsEmbedEvents.name);

  constructor(
    private readonly httpService: AppHttpService,
    private readonly client: Client,
  ) {}

  @On('messageCreate')
  public async onTwitterMessage(
    @Context() [message]: ContextOf<'messageCreate'>,
  ) {
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.GuildText) return;
    if (!message.content.match(SnsEmbedConstants.TWITTER_URL_REGEX)?.length)
      return;

    const match =
      message.content
        .match(SnsEmbedConstants.TWITTER_URL_REGEX)
        ?.filter(Boolean) || [];
    const [, user, tweetid] = match;
    if (!user) return;

    const type: TEmbedType = tweetid ? 'tweet' : 'user';

    try {
      if ('sendTyping' in message.channel) await message.channel.sendTyping();

      const response = await this.httpService.get(
        SnsEmbedConstants.FXTWITTER_API(user, tweetid),
      );
      const data: any = tweetid ? response.data?.tweet : response.data?.user;

      if (!data) return;

      await message.suppressEmbeds(true).catch(() => {});

      const convertedData: IFxEmbed = this.toTwitterEmbed(type, data);

      let videos: AttachmentBuilder[] = [];
      let videoSizeLimitFlag = 0;

      if (type === 'tweet' && convertedData.videos?.length) {
        const videoSizeLimit =
          SnsEmbedConstants.DISCORD_UPLOAD_LIMITS[
            message.guild?.premiumTier || 0
          ];

        const videoChecks = await Promise.all(
          convertedData.videos.map(async (video) => {
            const videoSize = await checkVideoSize(video);
            if (videoSize > videoSizeLimit) return null;
            return new AttachmentBuilder(video);
          }),
        );

        videos = videoChecks.filter((v): v is AttachmentBuilder => v !== null);
        videoSizeLimitFlag = videoChecks.length - videos.length;
      }

      const msg: MessageReplyOptions = {
        content:
          videoSizeLimitFlag > 0
            ? `⚠️ ${videoSizeLimitFlag} video(s) were not included due to size limits.`
            : '',
        embeds: FxSnsEmbed(convertedData, this.client).flat(),
        allowedMentions: { repliedUser: false },
        files: videos,
      };

      await message.reply(msg);
    } catch (err) {
      this.logger.error('Twitter embed error', err);
    }
  }

  @On('messageCreate')
  public async onTiktokMessage(
    @Context() [message]: ContextOf<'messageCreate'>,
  ) {
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.GuildText) return;

    let url =
      message.content
        .match(new RegExp(SnsEmbedConstants.TIKTOK_URL_REGEX))
        ?.shift() ??
      message.content
        .match(new RegExp(SnsEmbedConstants.TIKTOK_SHORT_URL_REGEX))
        ?.shift() ??
      '';

    if (!url) return;

    try {
      if ('sendTyping' in message.channel) await message.channel.sendTyping();

      if (new RegExp(SnsEmbedConstants.TIKTOK_SHORT_URL_REGEX).test(url)) {
        const res = await this.httpService.get(url, {
          headers: { 'User-Agent': SnsEmbedConstants.BOT_USER_AGENT },
        });
        url =
          cheerio
            .load(res.data)('meta[property="og:url"]')
            .attr('content')
            ?.split('?')
            .shift() ?? '';
      }

      if (!url || !new RegExp(SnsEmbedConstants.TIKTOK_URL_REGEX).test(url))
        return;

      const postId = url.match(SnsEmbedConstants.TIKTOK_ID_REGEX)?.[1];
      if (!postId) return;

      const postRes = await this.httpService.get(
        SnsEmbedConstants.FXTIKTOK_API(postId),
      );
      const post: any = postRes.data;
      if (!post || post.visibility !== 'public') return;

      await message.suppressEmbeds(true).catch(() => {});

      let videos: AttachmentBuilder[] = [];
      let videoSizeLimitFlag = 0;

      const imageUrls: string[] =
        post.media_attachments?.map((media: any) => media.url) || [];
      const videoUrl: string | undefined = post.media_attachments?.find(
        (media: any) => media.type === 'video',
      )?.url;

      if (videoUrl) {
        const videoSizeLimit =
          SnsEmbedConstants.DISCORD_UPLOAD_LIMITS[
            message.guild?.premiumTier || 0
          ];
        const videoSize = await checkVideoSize(videoUrl);
        if (videoSize <= videoSizeLimit) {
          const videoAttachment = new AttachmentBuilder(videoUrl);
          videoAttachment.setName(`tiktok-${postId}.mp4`);
          videos.push(videoAttachment);
        } else {
          videoSizeLimitFlag++;
        }
      }

      const $ = cheerio.load(post.content || '');
      const stats = $('b').text().trim();
      $('b, br').remove();
      const content = $('body').text().trim();

      const convertedData: IFxEmbed = {
        source: 'tiktok',
        themeColor: 0x69c9d0,
        url: post.url,
        author: {
          name: `${post.account?.display_name} (@${post.account?.username})${post.account?.locked ? ' 🔒' : ''}`,
          url: post.account?.url,
        },
        thumbnail: post.account?.avatar_static,
        title: `${stats} 🕑 ${discordTimestamp(dayjs(post.created_at).unix(), 'RELATIVE_TIME')}`,
        description: content,
        icon: SnsEmbedConstants.TIKTOK_LOGO,
        images: imageUrls,
        videos: videoUrl ? [videoUrl] : [],
      };

      const embedGroups = FxSnsEmbed(convertedData, this.client);
      for (const embeds of embedGroups) {
        const msg: MessageReplyOptions = {
          content:
            videoSizeLimitFlag > 0
              ? '⚠️ Video size exceeds Discord limit, not included.'
              : '',
          embeds,
          allowedMentions: { repliedUser: false },
          files: videos,
        };
        await message.reply(msg);
        videos = []; // Only attach videos on first reply
      }
    } catch (err) {
      this.logger.error('TikTok embed error', err);
    }
  }

  private toTwitterEmbed(type: TEmbedType, data: any): IFxEmbed {
    if (type === 'tweet') {
      let description = '';
      if (data.replying_to) {
        description += `> **[Replying](https://x.com/${data.replying_to}/status/${data.replying_to_status}) to:** [@${data.replying_to}](https://x.com/${data.replying_to})\n\n`;
      }
      description += `${data.text}`;

      if (data.quote) {
        description +=
          `\n\n> **[Quoting](${data.quote.url}) ` +
          `from [@${data.quote.author.screen_name}](https://x.com/${data.quote.author.screen_name})**\n` +
          `${data.quote.text
            .split('\n')
            .map((line: string) => `> ${line}`)
            .join('\n')}`;
      }

      return {
        source: 'twitter',
        url: data.url,
        title:
          ` 💬 ${formatNumber(data.replies)}   ` +
          `🔁 ${formatNumber(data.retweets)}   ` +
          `❤️ ${formatNumber(data.likes)}   ` +
          `${data.views ? `👁️ ${formatNumber(data.views)}` : ''}   ` +
          `🕑 ${discordTimestamp(data.created_timestamp, 'RELATIVE_TIME')}`,
        author: {
          name: `${data.author.name} (@${data.author.screen_name}) ${data.author.verification?.verified ? '✅' : ''}`,
          url: data.author.url,
        },
        thumbnail: data.author.avatar_url || SnsEmbedConstants.TWITTER_LOGO,
        description,
        images: data.media?.photos?.map((photo: any) => photo.url) || [],
        videos: data.media?.videos?.map((video: any) => video.url) || [],
        themeColor: 0x1da1f2,
        icon: SnsEmbedConstants.TWITTER_LOGO,
      };
    }

    // User profile
    return {
      source: 'twitter',
      url: data.url,
      title: `${data.name}   🕑 ${discordTimestamp(dayjs(data.joined).unix(), 'RELATIVE_TIME')}`,
      thumbnail: data.avatar_url || SnsEmbedConstants.TWITTER_LOGO,
      images: data.banner_url ? [data.banner_url] : [],
      author: {
        name: `@${data.screen_name} ${data.verification?.verified ? '✅' : ''}${data.protected ? '🔒' : ''}`,
        url: data.url,
        icon_url: data.avatar_url || SnsEmbedConstants.TWITTER_LOGO,
      },
      description:
        data.description +
        `${data.website ? `\n> Website: [${data.website.display_url}](${data.website.url})` : ''}` +
        `${data.location ? `\n> Location: ${data.location}` : ''}`,
      fields: [
        { name: 'User ID', value: data.id, inline: true },
        { name: 'Tweets', value: data.tweets?.toString() || '0', inline: true },
        { name: 'Likes', value: data.likes?.toString() || '0', inline: true },
        {
          name: 'Followers',
          value: data.followers?.toString() || '0',
          inline: true,
        },
        {
          name: 'Following',
          value: data.following?.toString() || '0',
          inline: true,
        },
        {
          name: 'Media',
          value: data.media_count?.toString() || '0',
          inline: true,
        },
      ],
      themeColor: 0x1da1f2,
      icon: SnsEmbedConstants.TWITTER_LOGO,
    };
  }
}
