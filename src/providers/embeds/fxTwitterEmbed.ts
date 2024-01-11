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
    timestamp: new Date().toISOString(),
    footer: {
      text: `${bot.user?.displayName}・Twitter/X`,
      icon_url: 'https://about.twitter.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png',
    },
  };

  if (tweet.video) return EmbedBuilder.from(embed);

  if (tweet.image.includes('profile_images')) {
    embed.thumbnail = {
      url: tweet.image,
    };
  } else {
    embed.image = {
      url: tweet.image,
    };
  }

  return EmbedBuilder.from(embed);
};
