import { EmbedBuilder, Client } from 'discord.js';
import { PixivConstants } from './pixiv.constants';
import type { IPixivIllust, MetaPage } from './types';

export const PixivIllustListEmbeds = (
  illust: IPixivIllust,
  client?: Client,
): Array<EmbedBuilder> => {
  let imageUrls: Array<string> = [];

  if (illust.meta_pages.length > 0)
    imageUrls = illust.meta_pages.map(
      (metaPage: MetaPage) => metaPage.image_urls.large,
    );
  else imageUrls = [illust.meta_single_page.original_image_url];

  return imageUrls.slice(0, 4).map((imageUrl: string) =>
    new EmbedBuilder()
      .setColor(PixivConstants.PIXIV_EMBED_COLOR)
      .setURL(PixivConstants.PIXIV_ILLUST_URL + illust.id)
      .setAuthor({
        name: illust.user.name.slice(0, PixivConstants.EMBED_AUTHOR_NAME_LIMIT),
        iconURL: illust.user.profile_image_urls.medium.replace(
          PixivConstants.PIXIV_IMG_DOMAIN,
          PixivConstants.JACKLI_IMG_DOMAIN,
        ),
        url: PixivConstants.PIXIV_USER_URL + illust.user.id,
      })
      .setTitle(illust.title.slice(0, PixivConstants.EMBED_TITLE_LIMIT))
      .setDescription(
        `#${illust.tags.map((tag) => tag.translated_name ?? tag.name).join('　#')}`.slice(
          0,
          PixivConstants.EMBED_DESCRIPTION_LIMIT,
        ),
      )
      .addFields([
        {
          name: 'Views',
          value: illust.total_view.toString(),
          inline: true,
        },
        {
          name: 'Bookmarks',
          value: illust.total_bookmarks.toString(),
          inline: true,
        },
        {
          name: 'Comments',
          value: illust.total_comments.toString(),
          inline: true,
        },
      ])
      .setImage(
        imageUrl.replace(
          PixivConstants.PIXIV_IMG_DOMAIN,
          PixivConstants.JACKLI_IMG_DOMAIN,
        ),
      )
      .setTimestamp()
      .setFooter({
        text: `${client?.user?.displayName || 'Mika3K'}・Pixiv`,
        iconURL: PixivConstants.PIXIV_LOGO,
      }),
  );
};
