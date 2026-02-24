import { APIEmbed, EmbedBuilder, Client } from 'discord.js';
import { IFxEmbed } from './types';
import { SnsEmbedConstants } from './sns-embed.constants';

function splitToChunks<T>(arr: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

function omit<T extends Record<string, any>>(
  obj: T,
  ...keys: string[]
): Partial<T> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

export const FxSnsEmbed = (
  snsEmbedData: IFxEmbed,
  client?: Client,
): EmbedBuilder[][] => {
  const embed: APIEmbed = {
    color: snsEmbedData.themeColor,
    url: snsEmbedData.url,
    author: {
      name: snsEmbedData.author.name.slice(
        0,
        SnsEmbedConstants.EMBED_AUTHOR_NAME_LIMIT,
      ),
      url: snsEmbedData.author.url,
    },
    thumbnail: snsEmbedData.thumbnail
      ? { url: snsEmbedData.thumbnail }
      : undefined,
    title: snsEmbedData.title.slice(0, SnsEmbedConstants.EMBED_TITLE_LIMIT),
    description: snsEmbedData.description.slice(
      0,
      SnsEmbedConstants.EMBED_DESCRIPTION_LIMIT,
    ),
    timestamp: new Date().toISOString(),
    footer: {
      text: `${client?.user?.displayName || 'Mika3K'}`,
      icon_url: snsEmbedData.icon,
    },
    fields:
      snsEmbedData.fields?.map((field) => ({
        name: field.name.slice(0, SnsEmbedConstants.EMBED_FIELD_NAME_LIMIT),
        value: field.value.slice(0, SnsEmbedConstants.EMBED_FIELD_VALUE_LIMIT),
        inline: field.inline,
      })) || [],
  };

  if (snsEmbedData.videos?.length || !snsEmbedData.images?.length)
    return [[EmbedBuilder.from(embed)]];

  const imageChunks = splitToChunks(
    snsEmbedData.images,
    SnsEmbedConstants.EMBED_IMAGE_LIMIT,
  );

  if (imageChunks.length === 0) return [[EmbedBuilder.from(embed)]];

  const imageEmbeds: EmbedBuilder[] = [];

  imageChunks.forEach((chunk, index) => {
    embed.footer!.text = `${client?.user?.displayName || 'Mika3K'} (${index * 4 + 1} ~ ${index * 4 + chunk.length} of ${snsEmbedData.images?.length})`;

    if (index === 0)
      imageEmbeds.push(
        ...chunk.map((url) => EmbedBuilder.from(embed).setImage(url)),
      );
    else
      imageEmbeds.push(
        ...chunk.map((url) =>
          EmbedBuilder.from(
            omit(
              embed,
              'author',
              'title',
              'description',
              'thumbnail',
            ) as APIEmbed,
          )
            .setImage(url)
            .setURL(`${embed.url}#${imageChunks.indexOf(chunk) + 1}`),
        ),
      );
  });

  return imageEmbeds.length > 0
    ? splitToChunks(imageEmbeds, 8)
    : [[EmbedBuilder.from(embed)]];
};
