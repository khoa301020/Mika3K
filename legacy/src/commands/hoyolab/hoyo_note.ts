import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import HoYoLABConstants from '../../constants/hoyolab.js';
import { HoYoLABNoteEmbed } from '../../providers/embeds/hoyolabEmbed.js';
import { hoyolabApi } from '../../services/hoyolab.js';
import { IHoYoLABGameAccount, IHoYoLABUser, INoteResponse, THoyoGame } from '../../types/hoyolab.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
@SlashGroup({ name: 'hoyolab', description: 'HoYoLAB commands' })
export class HoYoLABInfo {
  @SlashGroup('hoyolab')
  @Slash({ description: 'Get HoYoLAB game note', name: 'note' })
  async note(
    @SlashChoice(
      ...Object.entries(HoYoLABConstants.REDEEM_TARGET)
        .filter(([, value]) => value.note)
        .map(([key, value]) => Object({ name: value.name, value: key })),
    )
    @SlashOption({
      description: 'Target game',
      name: 'target-game',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    target: Exclude<THoyoGame, 'hi3'>,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply();
    const userId = interaction.user.id;
    const user = await hoyolabApi.getUserInfo(userId);
    if (!user) return editOrReplyThenDelete(interaction, '❌ Account data not found, please save the cookie first.');

    const gameAccounts = user.hoyoUsers
      .map((hoyoUser: IHoYoLABUser) =>
        hoyoUser.gameAccounts
          .filter((gameAccount) => gameAccount.game === target)
          .map((gameAccount) => Object.assign(gameAccount, { cookie: hoyoUser.cookieString })),
      )
      .flat();

    if (gameAccounts.length === 0) return editOrReplyThenDelete(interaction, '❌ No account found.');

    let notes: Array<INoteResponse['data']> = await Promise.all(
      gameAccounts.map(
        async (
          gameAccount: IHoYoLABGameAccount & {
            cookie: string;
          },
        ) => {
          const { cookie } = gameAccount;
          const { data }: { data: INoteResponse } = await hoyolabApi.getNote(gameAccount, cookie);
          const noteData = data.data;
          if (noteData) {
            noteData.id = gameAccount.game_uid;
            noteData.nickname = gameAccount.nickname;
          }
          return noteData;
        },
      ),
    );

    notes = notes.filter((note) => note !== null);

    if (notes.length === 0) return editOrReplyThenDelete(interaction, '❌ No note found.');

    const embeds = notes.map((note) => HoYoLABNoteEmbed(note!, target));

    return interaction.editReply({ embeds });
  }
}
