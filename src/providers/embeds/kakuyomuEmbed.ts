import dayjs from 'dayjs';
import { EmbedBuilder } from 'discord.js';
import { CommonConstants, KakuyomuConstants } from '../../constants/index.js';
import { IKakuyomuNovel } from '../../types/kakuyomu.js';

export const KakuyomuNovelEmbed = (novel: IKakuyomuNovel): EmbedBuilder =>
  new EmbedBuilder()
    .setColor(CommonConstants.DEFAULT_EMBED_COLOR)
    .setTitle(`${novel.title}`)
    .setURL(KakuyomuConstants.NOVEL_URL(novel.novelId))
    .setAuthor({
      name: novel.authorName,
      url: KakuyomuConstants.USER_URL(novel.authorNameTag),
    })
    .setDescription(
      `${novel.safeRating ? '#' + novel.safeRating.join('　#') + '\n\n' : ''}**${novel.catchPhrase}**\n   ー ${
        novel.catchPhraseAuthor
      }`,
    )
    .addFields(
      { name: '執筆状況', value: novel.status, inline: true },
      { name: 'エピソード', value: novel.chaptersCount.toLocaleString() + '話', inline: true },
      {
        name: '種類',
        value: novel.type,
        inline: true,
      },
      { name: 'ジャンル', value: `[${novel.genre.name}](${KakuyomuConstants.GENRE_URL(novel.genre.tag)})` },
      {
        name: 'タグ',
        value: novel.tags.map((tag) => `[#${tag.name}](${KakuyomuConstants.TAG_URL(tag.tag)})`).join('　'),
      },
      { name: '総文字数', value: novel.wordsCount.toLocaleString() + '文字', inline: true },
      { name: '公開日', value: dayjs(novel.publishDate).format('YYYY/MM/DD HH:mm:ss'), inline: true },
      { name: '最終更新日', value: dayjs(novel.lastUpdate).format('YYYY/MM/DD HH:mm:ss'), inline: true },
      { name: 'おすすめレビュー', value: novel.reviewsCount.toLocaleString() + '人', inline: true },
      { name: '応援コメント', value: novel.commentsCount.toLocaleString() + '件', inline: true },
      { name: '小説フォロー数', value: novel.followersCount.toLocaleString() + '人', inline: true },
    )
    .addFields({
      name: 'あらすじ',
      value: novel.introduction.replace('…続きを読む', '').substring(0, CommonConstants.EMBED_DESCRIPTION_LIMIT),
    })
    .setTimestamp()
    .setFooter({ text: 'Kakuyomu', iconURL: KakuyomuConstants.KAKUYOMU_LOGO_URL });
