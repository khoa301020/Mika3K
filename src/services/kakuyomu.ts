import dayjs from 'dayjs';
import { KakuyomuConstants } from '../constants/index.js';
import Kakuyomu from '../models/Kakuyomu.js';
import { IKakuyomuDocument, IKakuyomuNovel, IKakuyomuNovelChapter } from '../types/kakuyomu';
import { TFollowTarget } from '../types/syosetu';
import { getHtml } from '../utils/index.js';

const getNovelHtml = async (novelId: string) => await getHtml(KakuyomuConstants.NOVEL_URL(novelId));

export const getNovelInfo = async (novelId: string): Promise<IKakuyomuNovel | null> => {
  const $ = await getNovelHtml(novelId);
  if (!$) return null;
  let isOneshot = false;
  const chaptersHtml = $('.widget-toc-chapter');
  let chapters: Array<IKakuyomuNovelChapter> = [];

  if (chaptersHtml.length === 0) {
    isOneshot = true;
    chapters.push({
      title: '本編',
      episodes: $('.widget-toc-episode')
        .map((_, episode) => ({
          title: $(episode).find('span').first().text(),
          episodeId: $(episode).find('a').attr('href')?.split('/').pop()!,
          lastUpdate: dayjs($(episode).find('time').attr('datetime'), 'YYYY-MM-DDTHH:mm:ssZ').toDate(),
        }))
        .get(),
    });
  } else {
    chapters = chaptersHtml
      .map((_, chapter) => ({
        title: $(chapter).find('span').first().text(),
        episodes: $(chapter)
          .nextUntil('.widget-toc-chapter')
          .filter('.widget-toc-episode')
          .map((_, episode) => ({
            title: $(episode).find('span').first().text(),
            episodeId: $(episode).find('a').attr('href')?.split('/').pop()!,
            lastUpdate: dayjs($(episode).find('time').attr('datetime'), 'YYYY-MM-DDTHH:mm:ssZ').toDate(),
          }))
          .get(),
      }))
      .get();
  }
  return {
    novelId: $('#work-information header h4 a').attr('href')?.split('/').pop()!,
    title: $('#work-information header h4 a').text(),
    isOneshot,
    authorName: $('#workAuthor-activityName a').text(),
    authorNameTag: $('#workAuthor-activityName a').attr('href')?.split('/').pop()!,
    status: $('.widget-toc-workStatus span:not(.js-vertical-composition-item)').text(),
    chapters,

    chaptersCount: parseInt($('#workInformationList dt:contains("エピソード")').next().text().replace(',', '')),
    type: $('#workInformationList dt:contains("種類")').next().text(),
    genre: {
      name: $('#workInformationList dd[itemprop=genre]').text(),
      tag: $('#workInformationList dd[itemprop=genre] a').attr('href')?.split('/').slice(-2).shift()!,
    },
    safeRating: $('#workInformationList dd span[itemprop=contentRating]')
      .map((_, e) => $(e).text())
      .get(),
    tags: $('#workInformationList dd span[itemprop=keywords]')
      .map((_, e) => ({
        name: $(e).text(),
        tag: $(e).find('a').attr('href')?.split('/').pop()!,
      }))
      .get(),

    wordsCount: parseInt($('#workInformationList dt:contains("総文字数")').next().text().replace(',', '')),
    publishDate: dayjs($('#workInformationList time[itemprop=datePublished]').attr('datetime')).toISOString(),
    lastUpdate: dayjs($('#workInformationList time[itemprop=dateModified]').attr('datetime')).toISOString(),

    reviewsCount: parseInt($('#workInformationList dt:contains("レビュー")').next().text().replace(',', '')),
    commentsCount: parseInt($('#workInformationList dt:contains("コメント")').next().text().replace(',', '')),
    followersCount: parseInt($('#workInformationList dt:contains("フォロー")').next().text().replace(',', '')),

    catchPhrase: $('#catchphrase-body').text(),
    catchPhraseAuthor: $('#catchphrase-authorLabel').text(),
    introduction: $('#introduction').text(),
    points: parseInt($('#workPoints .js-total-review-point-element').text().replace(',', '')),
  };
};

export const KakuyomuAPI = {
  getNovelInfo,
  checkNovelExists: async (novelId: string): Promise<[boolean, boolean]> => {
    const novel = await getNovelHtml(novelId);
    const isExists = novel ? true : false;
    if (!isExists) return [isExists, false];
    const isSaved = (await Kakuyomu.exists({ novelId })) ? true : false;
    return [isExists, isSaved];
  },
  saveNovelInfo: async (novelIds: Array<string>): Promise<unknown> => {
    let novels = (await Promise.all(novelIds.map((novelId) => getNovelInfo(novelId)))) as Array<IKakuyomuNovel>;

    if (!novels || novels.length < 1) throw new Error('❌ Novel not found');

    return await Kakuyomu.bulkWrite(
      novels.map((novel: IKakuyomuNovel) => ({
        updateOne: {
          filter: { novelId: novel.novelId },
          update: {
            $set: {
              novelId: novel.novelId,
              novelData: novel,
              lastSystemUpdate: new Date(),
            },
          },
          upsert: true,
        },
      })),
    );
  },
  followNovel: async (id: string, novelId: string, type: TFollowTarget): Promise<IKakuyomuDocument | null> =>
    await Kakuyomu.findOneAndUpdate({ novelId }, { $addToSet: { [`followings.${type}`]: id } }, { new: true }),
  unfollowNovel: async (id: string, novelId: string, type: TFollowTarget): Promise<IKakuyomuDocument | null> =>
    await Kakuyomu.findOneAndUpdate({ novelId }, { $pull: { [`followings.${type}`]: id } }, { new: true }),
};
