import { APIEmbed, EmbedBuilder } from 'discord.js';
import { CommonConstants } from '../../constants/index.js';
import { bot } from '../../main.js';
import { IFxEmbed } from '../../types/snsEmbed.js';
import { omit, splitToChunks } from '../../utils/index.js';

export const FxSnsEmbed = (snsEmbedData: IFxEmbed): EmbedBuilder[][] => {
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
      text: `${bot.user?.displayName}`,
      icon_url: snsEmbedData.icon,
    },
    fields: snsEmbedData.fields?.map(field => ({
      name: field.name.slice(0, CommonConstants.EMBED_FIELD_NAME_LIMIT),
      value: field.value.slice(0, CommonConstants.EMBED_FIELD_VALUE_LIMIT),
      inline: field.inline,
    })) || [],
  };

  if (snsEmbedData.videos?.length || !snsEmbedData.images?.length) return [[EmbedBuilder.from(embed)]];

  // Slice images to chunks, each chunk has 4 images
  const imageChunks = splitToChunks(snsEmbedData.images, CommonConstants.EMBED_IMAGE_LIMIT);

  if (imageChunks.length === 0) return [[EmbedBuilder.from(embed)]];

  const imageEmbeds: EmbedBuilder[] = [];

  imageChunks.forEach((chunk, index) => {
    embed.footer!.text = `${bot.user?.displayName} (${index * 4 + 1} ~ ${index * 4 + chunk.length} of ${snsEmbedData.images?.length})`;

    if (index === 0)
      imageEmbeds.push(...chunk.map(url =>
        EmbedBuilder.from(embed).setImage(url)));
    else
      imageEmbeds.push(...chunk.map(url =>
        EmbedBuilder.from(omit(embed, 'author', 'title', 'description', 'thumbnail'))
          .setImage(url)
          .setURL(`${embed.url}#${imageChunks.indexOf(chunk) + 1}`)))
  })



  return imageEmbeds.length > 0 ? splitToChunks(imageEmbeds, 8) : [[EmbedBuilder.from(embed)]];
};
