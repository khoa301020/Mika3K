import { Injectable, Logger } from '@nestjs/common';
import { Context, On } from 'necord';
import type { ContextOf } from 'necord';
import {
  AttachmentBuilder,
  ChannelType,
  Client,
  MessageReplyOptions,
} from 'discord.js';
import { SnsEmbedConstants } from './sns-embed.constants';
import { FxSnsEmbed } from './sns-embed.embeds';
import { SnsEmbedService } from './sns-embed.service';

@Injectable()
export class SnsEmbedEvents {
  private readonly logger = new Logger(SnsEmbedEvents.name);

  constructor(
    private readonly snsService: SnsEmbedService,
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

    try {
      if ('sendTyping' in message.channel) await message.channel.sendTyping();

      const convertedData = await this.snsService.getTwitterData(user, tweetid);
      if (!convertedData) return;

      await message.suppressEmbeds(true).catch(() => {});

      let videos: AttachmentBuilder[] = [];
      let videoSizeLimitFlag = 0;

      if (convertedData.videos?.length) {
        const videoSizeLimit =
          SnsEmbedConstants.DISCORD_UPLOAD_LIMITS[
            message.guild?.premiumTier || 0
          ];

        const videoChecks = await Promise.all(
          convertedData.videos.map(async (video) => {
            const videoSize = await this.snsService.checkVideoSize(video);
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
        url = await this.snsService.resolveShortTiktokUrl(url);
      }

      if (!url || !new RegExp(SnsEmbedConstants.TIKTOK_URL_REGEX).test(url))
        return;

      const postId = url.match(SnsEmbedConstants.TIKTOK_ID_REGEX)?.[1];
      if (!postId) return;

      const convertedData = await this.snsService.getTiktokData(url, postId);
      if (!convertedData) return;

      await message.suppressEmbeds(true).catch(() => {});

      let videos: AttachmentBuilder[] = [];
      let videoSizeLimitFlag = 0;

      if (convertedData.videos?.length) {
        const videoUrl = convertedData.videos[0];
        const videoSizeLimit =
          SnsEmbedConstants.DISCORD_UPLOAD_LIMITS[
            message.guild?.premiumTier || 0
          ];
        const videoSize = await this.snsService.checkVideoSize(videoUrl);

        if (videoSize <= videoSizeLimit) {
          const videoAttachment = new AttachmentBuilder(videoUrl);
          videoAttachment.setName(`tiktok-${postId}.mp4`);
          videos.push(videoAttachment);
        } else {
          videoSizeLimitFlag++;
        }
      }

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
}
