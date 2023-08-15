import { EmbedBuilder } from 'discord.js';
import { CommonConstants, PixivConstants } from '../../constants/index.js';
import { bot } from '../../main.js';
import { IPixivIllust, MetaPage } from '../../types/pixiv.js';

export const PixivIllustListEmbeds = (illust: IPixivIllust): Array<EmbedBuilder> => {
  let image_urls: Array<string> = [];
  if (illust.meta_pages.length > 0)
    image_urls = illust.meta_pages.map((metaPage: MetaPage) => metaPage.image_urls.large);
  else image_urls = [illust.meta_single_page.original_image_url];

  return image_urls.slice(0, 4).map((image_url: string) =>
    new EmbedBuilder()
      .setColor(PixivConstants.PIXIV_EMBED_COLOR)
      .setURL(PixivConstants.PIXIV_ILLUST_URL + illust.id)
      .setAuthor({
        name: illust.user.name.slice(0, CommonConstants.EMBED_AUTHOR_NAME_LIMIT),
        iconURL: illust.user.profile_image_urls.medium.replace(
          PixivConstants.PIXIV_IMG_DOMAIN,
          PixivConstants.JACKLI_IMG_DOMAIN,
        ),
        url: PixivConstants.PIXIV_USER_URL + illust.user.id,
      })
      .setTitle(illust.title.slice(0, CommonConstants.EMBED_TITLE_LIMIT))
      .setDescription(
        `#${illust.tags.map((tag) => tag.translated_name ?? tag.name).join(', #')}`.slice(
          0,
          CommonConstants.EMBED_DESCRIPTION_LIMIT,
        ),
      )
      .addFields([
        { name: 'Views', value: illust.total_view.toString(), inline: true },
        { name: 'Bookmarks', value: illust.total_bookmarks.toString(), inline: true },
        { name: 'Comments', value: illust.total_comments.toString(), inline: true },
      ])
      .setImage(image_url.replace(PixivConstants.PIXIV_IMG_DOMAIN, PixivConstants.JACKLI_IMG_DOMAIN))
      .setTimestamp()
      .setFooter({ text: `${bot.user?.displayName}・Pixiv`, iconURL: PixivConstants.PIXIV_LOGO }),
  );
};
