import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx';
import { SyosetuAPI } from '../../services/syosetu.js';
import { IMongooseDocumentNovel, TFollowAction, TFollowTarget } from '../../types/syosetu.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
@SlashGroup({ name: 'syosetu', description: 'Syosetu commands' })
class Syosetu {
  @SlashGroup('syosetu')
  @Slash({ name: 'follow', description: 'Follow/unfollow a novel' })
  async followSyosetu(
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
      description: 'The Ncode of the novel',
      name: 'ncode',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    ncode: string,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply();

    const isExists: [boolean, boolean] = await SyosetuAPI.checkNovelExists(ncode);
    if (!isExists[0]) {
      return editOrReplyThenDelete(interaction, '❌ Novel not found');
    }
    if (!isExists[1]) {
      await SyosetuAPI.saveNovelInfo(ncode);
    }

    let request: Promise<IMongooseDocumentNovel | null>;
    if (action === 'follow') {
      request = SyosetuAPI.followNovel(target === 'users' ? interaction.user.id : interaction.channelId, ncode, target);
    } else {
      request = SyosetuAPI.unfollowNovel(
        target === 'users' ? interaction.user.id : interaction.channelId,
        ncode,
        target,
      );
    }

    return request
      .then((res: IMongooseDocumentNovel | null) => {
        if (!res) {
          return interaction.editReply('❌ Something went wrong');
        }
        interaction.editReply(
          `✅ ${target === 'users' ? `User <@${interaction.user.id}>` : `Channel <#${interaction.channelId}>`} has ${
            action === 'follow' ? 'followed' : 'unfollowed'
          } the novel **${res.metadata.title}**`,
        );
      })
      .catch((err) => {
        editOrReplyThenDelete(interaction, `❌ ${err.message}`);
      });
  }
}
