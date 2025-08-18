import axios from 'axios';
import { AttachmentBuilder, MessagePayload, MessageReplyOptions } from 'discord.js';
import { ArgsOf, Discord, On } from 'discordx';
import { CommonConstants } from '../constants/index.js';
import { FxSnsEmbed } from '../providers/embeds/FxSnsEmbed.js';
import { IFxEmbed, TEmbedType } from '../types/snsEmbed';
import { checkVideoSize, discordTimestamp, formatNumber, isTextBasedChannel } from '../utils/index.js';
import { APITwitterStatus, APIUser } from '../types/fxtwitter.js';
import dayjs from 'dayjs';

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
    if (message.author.bot) return;
    if (!message.content.match(CommonConstants.TWITTER_URL_REGEX)?.length) return;

    const [_, user, tweetid] = message.content.match(CommonConstants.TWITTER_URL_REGEX)?.filter(Boolean) || [];
    console.log(`User: ${user}, Tweet ID: ${tweetid}`);
    if (!user) return;

    const type: TEmbedType = tweetid ? 'tweet' : 'user';

    message.channel.sendTyping();
    const data: APITwitterStatus | APIUser | null = await axios
      .get(CommonConstants.FXTWITTER_API(user, tweetid))
      .then((res) => tweetid ? (res.data?.tweet as APITwitterStatus) : (res.data?.user as APIUser))
      .catch(() => null);

    if (!data) return;

    await message.suppressEmbeds(true);

    const convertedData: IFxEmbed = toEmbed(type, data);

    let videos: AttachmentBuilder[] = [];
    let videoSizeLimitFlag = 0;

    // Size check for videos
    if (type === 'tweet' && convertedData.videos?.length) {
      const videoSizeLimit = CommonConstants.DISCORD_PERKS[message.guild?.premiumTier || 0].uploadLimit;

      // Check all video sizes in parallel
      const videoChecks = await Promise.all(
        convertedData.videos.map(async (video) => {
          const videoSize = await checkVideoSize(video);
          if (videoSize > videoSizeLimit) {
            console.log(`Video size exceeds limit: ${video} (${videoSize} bytes)`);
            return null;
          }
          return new AttachmentBuilder(video);
        })
      );

      // Filter out videos that exceeded the size limit
      videos = videoChecks.filter((v): v is AttachmentBuilder => v !== null);
      videoSizeLimitFlag = videoChecks.length - videos.length;
    }

    const msg: string | MessagePayload | MessageReplyOptions = {
      content: videoSizeLimitFlag > 0 ? `⚠️ ${videoSizeLimitFlag} video(s) were not included due to size limits.` : '',
      embeds: FxSnsEmbed(convertedData).flat(),
      allowedMentions: { repliedUser: false },
      files: videos,
    };

    await message.reply(msg);
  }
}


function toEmbed(type: TEmbedType, data: APITwitterStatus | APIUser): IFxEmbed {
  const res = {
    ...type === 'tweet' ? convertTweet(data as APITwitterStatus) : convertUser(data as APIUser),
    icon: CommonConstants.TWITTER_LOGO,
    themeColor: 0x1DA1F2
  }
  return res as IFxEmbed;
}

function convertTweet(tweet: APITwitterStatus): Partial<IFxEmbed> {
  let description = ''

  if (tweet.replying_to) {
    description += `\> **[Replying](https://x.com/${tweet.replying_to}/status/${tweet.replying_to_status}) to:** [@${tweet.replying_to}](https://x.com/${tweet.replying_to})\n\n`;
  }

  description += `${tweet.text}`;

  if (tweet.quote) {
    description += `\n\n\> **[Quoting](${tweet.quote.url}) ` +
      `from [@${tweet.quote.author.screen_name}](https://x.com/${tweet.quote.author.screen_name})**\n` +
      `${tweet.quote.text.split('\n').map(line => `\> ${line}`).join('\n')}`;
  }

  if (tweet.poll) {
    const isPollActive = dayjs(tweet.poll.ends_at).isAfter(dayjs());
    description += `\n\n> **Poll results:**\n> \n` +
      `${tweet.poll.choices.map((choice) => `> ${choice.label} - **${choice.percentage}%** (${choice.count} votes)`).join('\n')}` +
      `\n> ` +
      `\n> **Total Votes:** ${tweet.poll.total_votes}` +
      `\n> **Ends at:** ${dayjs(tweet.poll.ends_at).format('YYYY-MM-DD HH:mm:ss')} (${isPollActive ? dayjs(tweet.poll.ends_at).fromNow() : 'Concluded'})`;
  }

  return {
    url: tweet.url,
    title: ` 💬 ${formatNumber(tweet.replies)}   ` +
      `🔁 ${formatNumber(tweet.retweets)}   ` +
      `❤️ ${formatNumber(tweet.likes)}   ` +
      `${tweet.views ? `👁️ ${formatNumber(tweet.views)}` : ''}   ` +
      `🕑 ${discordTimestamp(tweet.created_timestamp, 'RELATIVE_TIME')}`,
    author: {
      name: `${tweet.author.name} (@${tweet.author.screen_name}) ${tweet.author.verification?.verified ? '✅' : ''}`,
      url: tweet.author.url
    },
    thumbnail: tweet.author.avatar_url ? tweet.author.avatar_url : CommonConstants.TWITTER_LOGO,
    description,
    images: tweet.media?.photos?.map(photo => photo.url) || [],
    videos: tweet.media?.videos?.map(video => video.url) || [],
  }
}

function convertUser(user: APIUser): Partial<IFxEmbed> {
  return {
    url: user.url,
    title: `${user.name}   🕑 ${discordTimestamp(dayjs(user.joined).unix(), 'RELATIVE_TIME')}`,
    thumbnail: user.avatar_url ? user.avatar_url : CommonConstants.TWITTER_LOGO,
    images: user.banner_url ? [user.banner_url] : [],
    author: {
      name: `@${user.screen_name} ${user.verification?.verified ? '✅' : ''}${user.protected ? '🔒' : ''}`,
      url: user.url,
      icon_url: user.avatar_url ? user.avatar_url : CommonConstants.TWITTER_LOGO,
    },
    description: user.description +
      `${user.website ? `\n> Website: [${user.website.display_url}](${user.website.url})` : ''}` +
      `${user.location ? `\n> Location: ${user.location}` : ''}`,
    fields: [
      { name: 'User ID', value: user.id, inline: true },
      { name: 'Tweets', value: user.tweets.toString(), inline: true },
      { name: 'Likes', value: user.likes.toString(), inline: true },
      { name: 'Followers', value: user.followers.toString(), inline: true },
      { name: 'Following', value: user.following.toString(), inline: true },
      { name: 'Media', value: user.media_count.toString(), inline: true }],
  }
}