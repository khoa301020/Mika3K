import { ApplicationCommandOptionType, CommandInteraction, TextChannel } from 'discord.js';
import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
  SlashGroup,
  SlashOption,
} from 'discordx';
import { CommonConstants, NHentaiConstants } from '../../constants/index.js';
import { NHentaiEmbed } from '../../providers/embeds/nhentaiEmbed.js';
import { commonPagination } from '../../providers/pagination.js';
import { simulateNHentaiRequest } from '../../services/nhentai.js';
import { INHentai } from '../../types/nhentai.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@SlashGroup({ description: 'NHentai commands', name: 'nhentai' })
@Discord()
class FindRelatedNHentai {
  @SlashGroup('nhentai')
  @Slash({ description: 'Find related NHentai', name: 'related' })
  async relatedNHentaiSlash(
    @SlashOption({
      description: 'NHentai code',
      name: 'code',
      required: true,
      type: ApplicationCommandOptionType.Integer,
    })
    code: string,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply({ ephemeral: !(interaction.channel as TextChannel)?.nsfw ?? true });
    const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_RELATED_ENDPOINT(code));
    console.log(res.config.url);
    if (!res.data || !res.data.result) {
      console.log(res.data);
      return await editOrReplyThenDelete(interaction, 'No result found');
    }
    const list: Array<INHentai> = res.data.result;
    const pages = list.map((book: INHentai, index: number) => {
      const embed = NHentaiEmbed(book, interaction.user, index + 1, list.length);
      return {
        embeds: [embed],
      };
    });
    const titles = list.map((book: INHentai) => book.title.pretty);
    const pagination = commonPagination(
      interaction,
      pages,
      CommonConstants.PAGINATION_TYPE.BUTTON,
      interaction.ephemeral!,
      titles,
    );

    return await pagination.send();
  }

  @SimpleCommand({ aliases: ['nhr', 'nhrelated'], description: 'Find related NHentai' })
  async relatedNHentaiCommand(
    @SimpleCommandOption({
      name: 'code',
      type: SimpleCommandOptionType.Number,
    })
    code: number,
    command: SimpleCommandMessage,
  ): Promise<any> {
    try {
      if (!code) return await editOrReplyThenDelete(command.message, { content: 'Please provide a code' });
      if (!(command.message.channel as TextChannel).nsfw)
        return await editOrReplyThenDelete(command.message, {
          content: 'This command can only be used in NSFW channel',
        });
      const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_RELATED_ENDPOINT(code));
      console.log(res.config.url);
      if (!res.data || !res.data.result) {
        console.log(res.data);
        return await editOrReplyThenDelete(command.message, 'No result found');
      }
      const list: Array<INHentai> = res.data.result;
      const pages = list.map((book: INHentai, index: number) => {
        const embed = NHentaiEmbed(book, command.message.author, index + 1, list.length);
        return {
          embeds: [embed],
        };
      });
      const titles = list.map((book: INHentai) => book.title.pretty);
      const pagination = commonPagination(command, pages, CommonConstants.PAGINATION_TYPE.BUTTON, false, titles);

      return await pagination.send();
    } catch (err: any) {
      console.log(err);
      return await editOrReplyThenDelete(command.message, { content: err.message });
    }
  }
}
