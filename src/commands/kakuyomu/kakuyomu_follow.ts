import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { KakuyomuAPI } from '../../services/kakuyomu.js';
import { IKakuyomuDocument } from '../../types/kakuyomu.js';
import { TFollowAction, TFollowTarget } from '../../types/syosetu.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
@SlashGroup({ name: 'novel', description: 'Novel commands' })
@SlashGroup({ name: 'kakuyomu', description: 'Kakuyomu commands', root: 'novel' })
class Kakuyomu {
  @SlashGroup('kakuyomu', 'novel')
  @Slash({ name: 'follow', description: 'Follow/unfollow a novel' })
  async followKakuyomu(
    @SlashChoice({ name: 'Follow', value: 'follow' }, { name: 'Unfollow', value: 'unfollow' })
    @SlashOption({
      description: 'Select action',
      name: 'action',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    action: TFollowAction,
    @SlashChoice({ name: 'This user', value: 'users' }, { name: 'This channel', value: 'channels' })
    @SlashOption({
      description: 'Select follow target',
      name: 'target',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    target: TFollowTarget,
    @SlashOption({
      description: 'The ID of the novel',
      name: 'novel-id',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    novelId: string,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply();

    const isExists: [boolean, boolean] = await KakuyomuAPI.checkNovelExists(novelId);
    if (!isExists[0]) {
      return editOrReplyThenDelete(interaction, '❌ Novel not found');
    }
    if (!isExists[1]) {
      await KakuyomuAPI.saveNovelInfo([novelId]);
    }

    let request: Promise<IKakuyomuDocument | null>;
    if (action === 'follow') {
      request = KakuyomuAPI.followNovel(
        target === 'users' ? interaction.user.id : interaction.channelId,
        novelId,
        target,
      );
    } else {
      request = KakuyomuAPI.unfollowNovel(
        target === 'users' ? interaction.user.id : interaction.channelId,
        novelId,
        target,
      );
    }

    return request
      .then((res: IKakuyomuDocument | null) => {
        if (!res) {
          return interaction.editReply('❌ Something went wrong');
        }
        interaction.editReply(
          `✅ ${target === 'users' ? `User <@${interaction.user.id}>` : `Channel <#${interaction.channelId}>`} has ${
            action === 'follow' ? 'followed' : 'unfollowed'
          } the novel **${res.novelData.title}**`,
        );
      })
      .catch((err) => {
        editOrReplyThenDelete(interaction, `❌ ${err.message}`);
      });
  }
}
