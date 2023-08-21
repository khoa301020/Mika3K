import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import CommonConstants from '../../constants/common.js';
import { SyosetuConstants } from '../../constants/index.js';
import { SyosetuNovelEmbed } from '../../providers/embeds/syosetuEmbed.js';
import { commonPagination } from '../../providers/pagination.js';
import { SyosetuAPI, convertToQuery } from '../../services/syosetu.js';
import {
  ICommandSingleSelect,
  ISyosetuNovel,
  ISyosetuRequest,
  ISyosetuResponseMeta,
  TLastUp,
  TOrder,
  TStop,
  TSyosetuBigGenre,
  TSyosetuGenre,
  TType,
} from '../../types/syosetu.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

const defaultRequest: ISyosetuRequest = {
  out: 'json',
  lim: 20,
  title: 1,
  ex: 1,
  keyword: 1,
  wname: 1,
};

@Discord()
@SlashGroup({ name: 'novel', description: 'Novel commands' })
class Syosetu {
  @SlashGroup('syosetu', 'novel')
  @Slash({ name: 'search', description: 'Search Syosetu novels' })
  async searchSyosetu(
    @SlashChoice(
      ...SyosetuConstants.ORDER.map((obj: ICommandSingleSelect) => Object({ name: obj.trans, value: obj.key })),
    )
    @SlashOption({
      description: 'Order result by',
      name: 'order',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    order: TOrder = 'new',
    @SlashOption({
      description: 'Word to search',
      name: 'word',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    word: string,
    @SlashOption({
      description: 'Word to not search',
      name: 'notword',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    notword: string,
    @SlashOption({
      description:
        'Filter by big genre(s) use ID (/syosetu list-genres), separate by comma, exclude by prefixing with -',
      name: 'big-genre',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    biggenres: string,
    @SlashOption({
      description: 'Filter by genre(s) use ID (/syosetu list-genres), separate by comma, exclude by prefixing with -',
      name: 'genre',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    genres: string,
    @SlashOption({
      description: 'Filter by author(s) use ID, separate by comma',
      name: 'userid',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    userids: string,
    @SlashChoice(
      ...SyosetuConstants.TYPES.map((obj: ICommandSingleSelect) => Object({ name: obj.trans, value: obj.key })),
    )
    @SlashOption({
      description: 'Filter by novel type',
      name: 'type',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    type: TType,
    @SlashOption({
      description: 'Filter by number of illustrations, format is <from>-<to>',
      name: 'sasie',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    sasie: string,
    @SlashOption({
      description: 'Filter by novel length (character), format is <from>-<to>',
      name: 'length',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    length: string,
    @SlashOption({
      description: 'Filter by read time (minute), format is <from>-<to>',
      name: 'time',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    time: string,
    @SlashOption({
      description: 'Filter by conversation rate (%), format is <from>-<to>, min is 0, max is 100',
      name: 'kaiwaritu',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    kaiwaritu: string,
    @SlashOption({
      description: 'Filter by N-code, separate by comma',
      name: 'ncode',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    ncode: string,

    @SlashChoice(
      ...SyosetuConstants.UPDATE_TIME.map((obj: ICommandSingleSelect) => Object({ name: obj.trans, value: obj.key })),
    )
    @SlashOption({
      description: 'Filter by last up (creation)',
      name: 'lastup',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    lastup: TLastUp,
    @SlashChoice(
      ...SyosetuConstants.UPDATE_TIME.map((obj: ICommandSingleSelect) => Object({ name: obj.trans, value: obj.key })),
    )
    @SlashOption({
      description: 'Filter by last update',
      name: 'lastupdate',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    lastupdate: TLastUp,
    @SlashOption({
      description: 'Filter by whether the novel is picked up',
      name: 'ispickup',
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    ispickup: boolean = false,
    @SlashOption({
      description: 'Filter by whether the novel is Isekai (both Reincarnation & Transfer)',
      name: 'istt',
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    istt: boolean,
    @SlashOption({
      description: "Filter by whether the novel is R15, DON'T SELECT IF NOT SPECIFIED",
      name: 'isr15',
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    isr15: boolean,
    @SlashOption({
      description: "Filter by whether the novel is BL (Boy's Love), DON'T SELECT IF NOT SPECIFIED",
      name: 'isbl',
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    isbl: boolean,
    @SlashOption({
      description: "Filter by whether the novel is GL (Girl's Love), DON'T SELECT IF NOT SPECIFIED",
      name: 'isgl',
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    isgl: boolean,
    @SlashOption({
      description: "Filter by whether the novel is Cruel depiction, DON'T SELECT IF NOT SPECIFIED",
      name: 'iszankoku',
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    iszankoku: boolean,
    @SlashOption({
      description: "Filter by whether the novel is Isekai Reincarnation, DON'T SELECT IF NOT SPECIFIED",
      name: 'istensei',
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    istensei: boolean,
    @SlashOption({
      description: "Filter by whether the novel is Isekai Transfer, DON'T SELECT IF NOT SPECIFIED",
      name: 'istenni',
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    istenni: boolean,
    @SlashChoice(
      { name: 'Excluding long-term serial suspension', value: 1 },
      { name: 'Get only long-term serial suspension', value: 2 },
    )
    @SlashOption({
      description: "Filter by serial suspension status, DON'T SELECT IF NOT SPECIFIED",
      name: 'stop',
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    stop: TStop,
    @SlashOption({
      description: 'Page number, know that each page has up to 20 (fixed) results, max is 100',
      name: 'page',
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    page: number,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply();

    let biggenre: Array<TSyosetuBigGenre> = [],
      notbiggenre: Array<TSyosetuBigGenre> = [],
      genre: Array<TSyosetuGenre> = [],
      notgenre: Array<TSyosetuGenre> = [];

    if (biggenres)
      biggenres.split(',').forEach((e) => {
        if (e.startsWith('-')) notbiggenre.push(parseInt(e.replace('-', '')) as TSyosetuBigGenre);
        else biggenre.push(parseInt(e) as TSyosetuBigGenre);
      });

    if (genres) {
      genres.split(',').forEach((e) => {
        if (e.startsWith('-')) notgenre.push(parseInt(e.replace('-', '')) as TSyosetuGenre);
        else genre.push(parseInt(e) as TSyosetuGenre);
      });
    }

    const request: ISyosetuRequest = Object.assign(
      defaultRequest,
      order && { order },
      word && { word },
      notword && { notword },
      biggenre.length > 0 && { biggenre },
      notbiggenre.length > 0 && { notbiggenre },
      genre.length > 0 && { genre },
      notgenre.length > 0 && { notgenre },
      userids && { userid: userids.split(',').filter((e) => e !== '') },
      type && { type },
      sasie && { sasie },
      length && { length },
      time && { time },
      ncode && { ncode: ncode.split(',').filter((e) => e !== '') },
      kaiwaritu && { kaiwaritu },
      lastup && { lastup },
      lastupdate && { lastupdate },
      (isr15 === true && { isr15: 1 }) || (isr15 === false && { notr15: 1 }),
      (isbl === true && { isbl: 1 }) || (isbl === false && { notbl: 1 }),
      (isgl === true && { isgl: 1 }) || (isgl === false && { notgl: 1 }),
      (iszankoku === true && { iszankoku: 1 }) || (iszankoku === false && { notzankoku: 1 }),
      (istensei === true && { istensei: 1 }) || (istensei === false && { nottensei: 1 }),
      (istenni === true && { istenni: 1 }) || (istenni === false && { nottenni: 1 }),
      istt === true && { istt: 1 },
      ispickup === true && { ispickup: 1 },
      stop && { stop },
      page && page >= 2 && page <= 100 && { st: page * 20 - 19 }, // start from 1, 21, 41,...
    );

    console.log(SyosetuConstants.SYOSETU_BASE_URL + convertToQuery(request));
    const res = await SyosetuAPI.getNovel(request);

    const syosetuRes: Array<ISyosetuResponseMeta | ISyosetuNovel> = res.data;

    const meta = syosetuRes[0] as ISyosetuResponseMeta;
    if (meta.allcount === 0) return editOrReplyThenDelete(interaction, '❌ No result found');

    const novels = syosetuRes.slice(1) as Array<ISyosetuNovel>;

    const pages = novels.map((novel: ISyosetuNovel, index) => {
      return {
        embeds: [SyosetuNovelEmbed(novel, interaction.user, index + 1, defaultRequest.lim)],
      };
    });

    const pagination = commonPagination(interaction, pages, CommonConstants.PAGINATION_TYPE.BUTTON, false);

    return await pagination.send();
  }
}
