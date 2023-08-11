import { EmbedBuilder } from 'discord.js';
import { PixivConstants } from '../../constants/index.js';
import { IPixivIllust, MetaPage } from '../../types/pixiv.js';

export const PixivIllustListEmbeds = (illust: IPixivIllust): Array<EmbedBuilder> =>
  illust.meta_pages.slice(0, 3).map((metaPage: MetaPage) =>
    new EmbedBuilder()
      .setURL(PixivConstants.PIXIV_ILLUST_URL + illust.id)
      .setImage(metaPage.image_urls.large.replace(PixivConstants.PIXIV_IMG_DOMAIN, PixivConstants.JACKLI_IMG_DOMAIN))
      .setTimestamp()
      .setFooter({ text: 'Pixiv', iconURL: PixivConstants.PIXIV_LOGO }),
  );
