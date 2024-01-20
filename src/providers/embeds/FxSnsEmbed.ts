import { APIEmbed, EmbedBuilder } from 'discord.js';
import { CommonConstants } from '../../constants/index.js';
import { bot } from '../../main.js';
import { IFxEmbed } from '../../types/snsEmbed.js';

export const FxSnsEmbed = (snsEmbed: IFxEmbed): EmbedBuilder => {
  const embed: APIEmbed = {
    color: snsEmbed.themeColor,
    url: snsEmbed.url,
    author: {
      name: snsEmbed.author.name.slice(0, CommonConstants.EMBED_AUTHOR_NAME_LIMIT),
      url: snsEmbed.author.url,
    },
    title: snsEmbed.title.slice(0, CommonConstants.EMBED_TITLE_LIMIT),
    description: snsEmbed.description.slice(0, CommonConstants.EMBED_DESCRIPTION_LIMIT),
    timestamp: new Date().toISOString(),
    footer: {
      text: `${bot.user?.displayName}・${snsEmbed.source}`,
      icon_url: snsEmbed.icon,
    },
  };

  if (snsEmbed.video) return EmbedBuilder.from(embed);

  if (snsEmbed.image.includes('profile_images')) {
    embed.thumbnail = {
      url: snsEmbed.image,
    };
  } else {
    embed.image = {
      url: snsEmbed.image,
    };
  }

  return EmbedBuilder.from(embed);
};
