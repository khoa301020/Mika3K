// import type { ArgsOf, Client } from 'discordx';
import axios, { AxiosResponse } from 'axios';
import { ChannelType } from 'discord.js';
import { ArgsOf, Discord, On } from 'discordx';
import { PixivConstants } from '../constants/index.js';
import { cache } from '../main.js';
import { PixivIllustListEmbeds } from '../providers/embeds/pixivEmbed.js';
import { IPixivIllustResponse } from '../types/pixiv';
import { editOrReplyThenDelete } from '../utils/index.js';

@Discord()
export class CommonEvents {
  /**
   * Pixiv preview
   *
   * @param {ArgsOf<'messageCreate'>} [message]
   * @memberof CommonEvents
   *
   */
  @On({ event: 'messageCreate' })
  async PixivPreview([message]: ArgsOf<'messageCreate'>): Promise<void> {
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.GuildText) return;
    if (!message.content.match(PixivConstants.PIXIV_ILLUST_URL_REGEX)) return;
    const match = message.content.match(PixivConstants.PIXIV_ILLUST_URL_REGEX);

    if (!match) return;

    const illustIds = match.slice(1);

    if (illustIds.length === 0) return;

    message.channel.sendTyping();
    let response: AxiosResponse;
    if (cache.has('pixivAccessToken'))
      try {
        response = await axios.get(PixivConstants.PIXIV_ILLUST_API(illustIds[0]), {
          headers: {
            'User-Agent': 'PixivAndroidApp/5.0.64 (Android 6.0)',
          },
        });
      } catch (error) {
        response = await axios.get(PixivConstants.HIBIAPI_ILLUST_API(illustIds[0]));
      }
    else response = await axios.get(PixivConstants.HIBIAPI_ILLUST_API(illustIds[0]));

    const illustRes: IPixivIllustResponse = response.data;
    if (!illustRes || !illustRes.illust) return;

    if (!message.channel.nsfw && illustRes.illust.x_restrict !== PixivConstants.PIXIV_SAFE_VALUE)
      return editOrReplyThenDelete(message, '❌ This illust is NSFW, preview is only available in NSFW channels.');

    await message.suppressEmbeds(true);

    await message.reply({
      embeds: [...PixivIllustListEmbeds(illustRes.illust)],
      allowedMentions: { repliedUser: false },
    });
  }
}
