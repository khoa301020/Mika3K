import { APIEmbed, EmbedBuilder } from 'discord.js';
import { CommonConstants } from '../../constants/index.js';
import { bot } from '../../main.js';
import { IFxTweet } from '../../types/twitter.js';

export const FxTwitterEmbed = (tweet: IFxTweet): EmbedBuilder => {
  const embed: APIEmbed = {
    color: tweet.themeColor,
    url: tweet.url,
    author: {
      name: tweet.author.name.slice(0, CommonConstants.EMBED_AUTHOR_NAME_LIMIT),
      url: tweet.author.url,
    },
    title: tweet.title.slice(0, CommonConstants.EMBED_TITLE_LIMIT),
    description: tweet.description.slice(0, CommonConstants.EMBED_DESCRIPTION_LIMIT),
  };

  if (tweet.video) {
    embed.video = {
      url: tweet.video.url,
      proxy_url: tweet.video.url,
      height: tweet.video.height,
      width: tweet.video.width,
    };
  }

  return EmbedBuilder.from(embed)
    .setImage(tweet.image)
    .setTimestamp()
    .setFooter({
      text: `${bot.user?.displayName}・Twitter/X`,
      iconURL: 'https://about.twitter.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png',
    });
};
