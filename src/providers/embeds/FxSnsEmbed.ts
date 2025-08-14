import { APIEmbed, EmbedBuilder } from 'discord.js';
import { CommonConstants } from '../../constants/index.js';
import { bot } from '../../main.js';
import { IFxEmbed } from '../../types/snsEmbed.js';

export const FxSnsEmbed = (snsEmbedData: IFxEmbed): EmbedBuilder[] => {
  const embed: APIEmbed = {
    color: snsEmbedData.themeColor,
    url: snsEmbedData.url,
    author: {
      name: snsEmbedData.author.name.slice(0, CommonConstants.EMBED_AUTHOR_NAME_LIMIT),
      url: snsEmbedData.author.url,
    },
    thumbnail: snsEmbedData.thumbnail ? { url: snsEmbedData.thumbnail } : undefined,
    title: snsEmbedData.title.slice(0, CommonConstants.EMBED_TITLE_LIMIT),
    description: snsEmbedData.description.slice(0, CommonConstants.EMBED_DESCRIPTION_LIMIT),
    timestamp: new Date().toISOString(),
    footer: {
      text: `${bot.user?.displayName}・Twitter/X`,
      icon_url: snsEmbedData.icon,
    },
    fields: snsEmbedData.fields?.map(field => ({
      name: field.name.slice(0, CommonConstants.EMBED_FIELD_NAME_LIMIT),
      value: field.value.slice(0, CommonConstants.EMBED_FIELD_VALUE_LIMIT),
      inline: field.inline,
    })) || [],
  };

  if (!snsEmbedData.images?.length) return [EmbedBuilder.from(embed)];

  console.log(`FxSnsEmbed: ${snsEmbedData.images.length} images found: ${snsEmbedData.images.join(', ')}`);

  return snsEmbedData.images.map(image => EmbedBuilder.from({ ...embed, image: { url: image } }));
};
