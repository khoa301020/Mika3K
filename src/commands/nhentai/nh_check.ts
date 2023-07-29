import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CommandInteraction,
  Message,
  MessageContextMenuCommandInteraction,
  TextChannel,
} from 'discord.js';
import {
  ContextMenu,
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
import { editOrReplyThenDelete, timeout } from '../../utils/index.js';

@SlashGroup({ description: 'NHentai commands', name: 'nhentai' })
@Discord()
class CheckNHentaiCode {
  @SlashGroup('nhentai')
  @Slash({ description: 'Check NHentai nuke code', name: 'check' })
  async checkCodeSlash(
    @SlashOption({
      description: 'NHentai code',
      name: 'code',
      required: true,
      type: ApplicationCommandOptionType.Integer,
    })
    code: string,
    interaction: CommandInteraction,
  ): Promise<void | Message<boolean>> {
    await interaction.deferReply({ ephemeral: !(interaction.channel as TextChannel)?.nsfw ?? true });
    const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_GALLERY_ENDPOINT(code));
    if (!res.data) return await editOrReplyThenDelete(interaction, { content: '❌ Code not found' });
    const embed = NHentaiEmbed(res.data, interaction.user);
    return await interaction.editReply({ embeds: [embed] });
  }

  @SimpleCommand({ aliases: ['nhentai', 'nh'], description: 'Check NHentai nuke code' })
  async checkCodeCommand(
    @SimpleCommandOption({
      name: 'code',
      type: SimpleCommandOptionType.Number,
    })
    code: number,
    command: SimpleCommandMessage,
  ): Promise<any> {
    try {
      if (!code) return await editOrReplyThenDelete(command.message, { content: '❌ Please provide a code' });
      if (!(command.message.channel as TextChannel).nsfw)
        return await editOrReplyThenDelete(command.message, {
          content: '❌ This command can only be used in NSFW channel',
        });
      const content = command.message.content
        .replace(/<a?:.+?:\d+>/g, '') // remove all emojis
        .replace(/<@!?\d+>/g, '') // remove all mentions
        .replace(/https?:\/\/\S+/g, ''); // remove all links (both http and https)

      const codes: Array<string> | null = content.match(/\d{6}/g);
      if (!codes) return editOrReplyThenDelete(command.message, { content: '❌ No code found in the message' });
      let results: Array<INHentai> = [];
      for (const code of codes) {
        const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_GALLERY_ENDPOINT(code));
        if (!res.data || res.status === 404) continue;
        results.push(res.data);
        await timeout(3333);
      }
      if (results.length === 0) return await editOrReplyThenDelete(command.message, { content: '❌ No code found' });
      if (results.length === 1) {
        const embed = NHentaiEmbed(results[0], command.message.author);
        return await command.message.edit({ embeds: [embed] });
      } else {
        const pages = results.map((book: INHentai, index: number) => {
          const embed = NHentaiEmbed(book, command.message.author, index + 1, results.length);
          return {
            embeds: [embed],
          };
        });
        const pagination = commonPagination(command, pages, CommonConstants.PAGINATION_TYPE.BUTTON, false);

        return await pagination.send();
      }
    } catch (err: any) {
      console.log(err);
      return await editOrReplyThenDelete(command.message, { content: err.message });
    }
  }

  @ContextMenu({
    name: 'Check nuke',
    type: ApplicationCommandType.Message,
  })
  async checkCodeContextMenu(interaction: MessageContextMenuCommandInteraction): Promise<any> {
    await interaction.deferReply({ ephemeral: !(interaction.channel as TextChannel)?.nsfw });
    const message: Message = await (interaction.channel as TextChannel).messages.fetch(interaction.targetId);

    const content = message.content
      .replace(/<a?:.+?:\d+>/g, '') // remove all emojis
      .replace(/<@!?\d+>/g, '') // remove all mentions
      .replace(/https?:\/\/\S+/g, ''); // remove all links (both http and https)

    const codes: Array<string> | null = content.match(/\d{6}/g);
    if (!codes) return editOrReplyThenDelete(interaction, { content: '❌ No code found in the message' });
    let results: Array<INHentai> = [];
    for (const code of codes) {
      const res = await simulateNHentaiRequest(NHentaiConstants.NHENTAI_GALLERY_ENDPOINT(code));
      if (!res.data || res.status === 404) continue;
      results.push(res.data);
      await timeout(3333);
    }
    if (results.length === 0) return await editOrReplyThenDelete(interaction, { content: '❌ No code found' });
    if (results.length === 1) {
      const embed = NHentaiEmbed(results[0], interaction.user);
      return await interaction.editReply({ embeds: [embed] });
    } else {
      const pages = results.map((book: INHentai, index: number) => {
        const embed = NHentaiEmbed(book, interaction.user, index + 1, results.length);
        return {
          embeds: [embed],
        };
      });
      const pagination = commonPagination(
        interaction,
        pages,
        CommonConstants.PAGINATION_TYPE.BUTTON,
        interaction.ephemeral ?? true,
      );

      return await pagination.send();
    }
  }
}
