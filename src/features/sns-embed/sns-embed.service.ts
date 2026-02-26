import { Injectable, Logger } from '@nestjs/common';
import { AppHttpService } from '../../shared/http';
import { SnsEmbedConstants } from './sns-embed.constants';
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

@Injectable()
export class SnsEmbedService {
  private readonly logger = new Logger(SnsEmbedService.name);

  constructor(private readonly httpService: AppHttpService) {}

  public async getTwitterData(
    user: string,
    tweetId?: string,
  ): Promise<IFxEmbed | null> {
    try {
      const response = await this.httpService.get(
        SnsEmbedConstants.FXTWITTER_API(user, tweetId),
      );
      const data: any = tweetId ? response.data?.tweet : response.data?.user;

      if (!data) return null;

      const type: TEmbedType = tweetId ? 'tweet' : 'user';
      return this.toTwitterEmbed(type, data);
    } catch (err) {
      this.logger.error('Twitter fetch error', err);
      return null;
    }
  }

  public async getTiktokData(
    url: string,
    postId: string,
  ): Promise<IFxEmbed | null> {
    try {
      const postRes = await this.httpService.get(
        SnsEmbedConstants.FXTIKTOK_API(postId),
      );
      const post: any = postRes.data;
      if (!post || post.visibility !== 'public') return null;

      const imageUrls: string[] =
        post.media_attachments?.map((media: any) => media.url) || [];
      const videoUrl: string | undefined = post.media_attachments?.find(
        (media: any) => media.type === 'video',
      )?.url;

      const $ = cheerio.load(post.content || '');
      const stats = $('b').text().trim();
      $('b, br').remove();
      const content = $('body').text().trim();

      return {
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
    } catch (err) {
      this.logger.error('TikTok fetch error', err);
      return null;
    }
  }

  public async checkVideoSize(url: string): Promise<number> {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return parseInt(res.headers.get('content-length') || '0', 10);
    } catch {
      return Infinity;
    }
  }

  public async resolveShortTiktokUrl(url: string): Promise<string> {
    try {
      const res = await this.httpService.get(url, {
        headers: { 'User-Agent': SnsEmbedConstants.BOT_USER_AGENT },
      });
      return (
        cheerio
          .load(res.data)('meta[property="og:url"]')
          .attr('content')
          ?.split('?')
          .shift() ?? ''
      );
    } catch (err) {
      this.logger.error('Failed to resolve TikTok short URL', err);
      return '';
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
