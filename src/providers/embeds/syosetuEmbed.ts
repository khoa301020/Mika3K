import type { User } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { CommonConstants } from '../../constants/index.js';
import { SyosetuConstants } from '../../constants/syosetu.js';
import {
  ISyosetuNovel,
  ISyosetuNovelPointsFields,
  ISyosetuNovelStatusFields,
  ISyosetuNovelTagsFields,
} from '../../types/syosetu.js';

const lang = 'jp';

export const SyosetuNovelEmbed = (novel: ISyosetuNovel, author: User, page?: number, total?: number): EmbedBuilder => {
  const tagFields: Array<string> = Object.keys(SyosetuConstants.NOVEL_TAGS).reduce((acc, key) => {
    if (novel[key as keyof ISyosetuNovel] === 1)
      acc.push(SyosetuConstants.NOVEL_TAGS[key as keyof ISyosetuNovelTagsFields][lang]);
    return acc;
  }, [] as Array<string>);
  const statusFields: Array<string> = Object.keys(SyosetuConstants.NOVEL_STATUS).reduce((acc, key) => {
    acc.push(
      SyosetuConstants.NOVEL_STATUS[key as keyof ISyosetuNovelStatusFields][
        novel[key as keyof ISyosetuNovel] as number
      ][lang],
    );
    return acc;
  }, [] as Array<string>);

  const genre = SyosetuConstants.GENRES[novel.genre][lang];

  return new EmbedBuilder()
    .setColor(CommonConstants.DEFAULT_EMBED_COLOR)
    .setTitle(
      `【${novel.ncode}】【${SyosetuConstants.NOVEL_TYPE[novel.novel_type][lang]}】${novel.title}`.substring(
        0,
        CommonConstants.EMBED_TITLE_LIMIT,
      ),
    )
    .setURL(`${SyosetuConstants.NCODE_NOVEL_BASE_URL}${novel.ncode?.toLowerCase()}`)
    .setDescription(
      `#${novel.keyword?.replace(/\s+/g, '　#')}`.substring(0, CommonConstants.EMBED_DESCRIPTION_LIMIT) ??
        'キーワードなし',
    )
    .setAuthor({
      name: `${author.username}#${author.discriminator}`.substring(0, CommonConstants.EMBED_AUTHOR_NAME_LIMIT),
      iconURL: author.displayAvatarURL(),
    })
    .addFields({ name: '作者名', value: `[${novel.writer}](${SyosetuConstants.SYOSETU_USER_PAGE + novel.userid})` })
    .addFields({ name: 'ジャンルとカテゴリ', value: `${genre}・${tagFields.join('・')}`.replace(/・$/, '') })
    .addFields({ name: '状況', value: statusFields.join('・') })
    .addFields({
      name: 'ポイント',
      value: `\`\`\`${Object.keys(SyosetuConstants.NOVEL_POINTS)
        .reduce((acc, key) => {
          acc.push(
            `${SyosetuConstants.NOVEL_POINTS[key as keyof ISyosetuNovelPointsFields][lang]}: ${
              novel[key as keyof ISyosetuNovel]
            }`,
          );
          return acc;
        }, [] as Array<string>)
        .join('\n')}\`\`\``,
    })
    .addFields({
      name: '小説のあらすじ',
      value: novel.story ? `\`\`\`${novel.story.substring(0, 1000)}\`\`\`` : 'あらすじなし',
    })
    .setTimestamp()
    .setFooter({
      text: `Syosetu (${page}/${total})`,
      iconURL: SyosetuConstants.SYOSETU_LOGO,
    });
};
