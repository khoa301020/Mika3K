import { AxiosResponse } from 'axios';
import {
  APIAttachment,
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
  SlashOption,
} from 'discordx';
import { CommonConstants } from '../../constants/index.js';
import { SauceNAOResultEmbed } from '../../providers/embeds/saucenaoEmbed.js';
import { commonPagination } from '../../providers/pagination.js';
import { saucenao } from '../../services/saucenao.js';
import {
  ISaucenaoSearchRequest,
  ISaucenaoSearchResponse,
  ISaucenaoSearchResponseResult,
} from '../../types/saucenao.js';
import { editOrReplyThenDelete } from '../../utils/index.js';

@Discord()
class SauceNAO {
  @SimpleCommand({ aliases: ['saucenao', 'sn'], description: 'Search SauceNAO', argSplitter: ' ' })
  async saucenaoCommand(
    @SimpleCommandOption({ name: 'url', type: SimpleCommandOptionType.String })
    url: string,
    command: SimpleCommandMessage,
  ): Promise<any> {
    const attachments = command.message.attachments.map((a) => a.url);

    if (!url && attachments.length === 0)
      return editOrReplyThenDelete(command.message, '❌ Url or attachment required.');
    if (url && attachments.length > 0)
      return editOrReplyThenDelete(command.message, '❌ Only one of url or attachment is allowed.');
    if (attachments.length > 1) return editOrReplyThenDelete(command.message, '❌ Too many attachments.');
    // if (url && !Constants.REGEX_IMAGE_URL.test(url)) return editOrReplyThenDelete(interaction, 'Image URL is not valid.');

    const request: ISaucenaoSearchRequest = Object.assign(
      {
        output_type: 2,
        api_key: process.env.SAUCENAO_API_KEY!,
        testmode: 1,
        db: 999,
        dedupe: 1,
        hide: 0,
      },
      url && { url },
      attachments.length > 0 && { url: attachments[0] },
    );

    const response: AxiosResponse = await saucenao(request);

    if (response.status !== 200) return editOrReplyThenDelete(command.message, { content: '❌ Search failed.' });

    const data: ISaucenaoSearchResponse = response.data;

    if (data.header?.status !== 0)
      return editOrReplyThenDelete(command.message, { content: `❌ ${data.header?.message}` });

    if (data.results?.length === 0) return editOrReplyThenDelete(command.message, { content: `❌ No result found.` });

    data.results = data.results?.filter(
      (result: ISaucenaoSearchResponseResult) =>
        parseFloat(result.header?.similarity!) > data.header?.minimum_similarity!,
    );

    if (data.results?.length === 0)
      return editOrReplyThenDelete(command.message, { content: `❌ The results' similarity is too low.` });

    const pages = data.results!.map((result: ISaucenaoSearchResponseResult, index: number) => {
      const embed = SauceNAOResultEmbed(command.message.author, result, index + 1, data.results!.length);

      return { embeds: [embed] };
    });

    const pagination = commonPagination(command, pages, CommonConstants.PAGINATION_TYPE.BUTTON, false);
    return await pagination.send();
  }

  @Slash({ description: 'SauceNAO search', name: 'saucenao' })
  async saucenao(
    @SlashOption({
      description: 'Public result?',
      name: 'is-public',
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    isPublic: boolean,
    @SlashOption({
      description: "Image's URL",
      name: 'url',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    url: string,
    @SlashOption({
      description: "Quote 's attachment (only 1 for slash)",
      name: 'attachment',
      required: false,
      type: ApplicationCommandOptionType.Attachment,
    })
    attachment: APIAttachment,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply({ ephemeral: !isPublic });

    if (!url && !attachment) return editOrReplyThenDelete(interaction, '❌ Url or attachment required.');
    if (url && attachment) return editOrReplyThenDelete(interaction, '❌ Only one of url or attachment is allowed.');
    // if (url && !Constants.REGEX_IMAGE_URL.test(url)) return editOrReplyThenDelete(interaction, 'Image URL is not valid.');

    const request: ISaucenaoSearchRequest = Object.assign(
      {
        output_type: 2,
        api_key: process.env.SAUCENAO_API_KEY!,
        testmode: 1,
        db: 999,
        dedupe: 1,
        hide: 0,
      },
      url && { url },
      attachment && { url: attachment.url },
    );

    const response: AxiosResponse = await saucenao(request);

    if (response.status !== 200) return editOrReplyThenDelete(interaction, { content: '❌ Search failed.' });

    const data: ISaucenaoSearchResponse = response.data;

    if (data.header?.status !== 0) return editOrReplyThenDelete(interaction, { content: `❌ ${data.header?.message}` });

    if (data.results?.length === 0) return editOrReplyThenDelete(interaction, { content: `❌ No result found.` });

    data.results = data.results?.filter(
      (result: ISaucenaoSearchResponseResult) =>
        parseFloat(result.header?.similarity!) > data.header?.minimum_similarity!,
    );

    if (data.results?.length === 0)
      return editOrReplyThenDelete(interaction, { content: `❌ The results' similarity is too low.` });

    const pages = data.results!.map((result: ISaucenaoSearchResponseResult, index: number) => {
      const embed = SauceNAOResultEmbed(interaction.user, result, index + 1, data.results!.length);

      return { embeds: [embed] };
    });

    const pagination = commonPagination(interaction, pages, CommonConstants.PAGINATION_TYPE.BUTTON, !isPublic);
    return await pagination.send();
  }

  @ContextMenu({
    name: 'Search SauceNAO',
    type: ApplicationCommandType.Message,
  })
  async messageHandler(interaction: MessageContextMenuCommandInteraction): Promise<any> {
    await interaction.deferReply();
    const message: Message = await (interaction.channel as TextChannel).messages.fetch(interaction.targetId);

    let url = message.content;
    const attachments = message.attachments.map((a) => a.url);

    if (!url && attachments.length === 0) return editOrReplyThenDelete(interaction, '❌ Url or attachment required.');
    if (attachments.length > 1) return editOrReplyThenDelete(interaction, '❌ Too many attachments.');
    if (attachments.length > 0) url = attachments[0];
    // if (url && !Constants.REGEX_IMAGE_URL.test(url)) return editOrReplyThenDelete(interaction, 'Image URL is not valid.');

    const request: ISaucenaoSearchRequest = {
      output_type: 2,
      api_key: process.env.SAUCENAO_API_KEY!,
      testmode: 1,
      db: 999,
      dedupe: 1,
      hide: 0,
      url,
    };

    const response: AxiosResponse = await saucenao(request);

    if (response.status !== 200) return editOrReplyThenDelete(interaction, { content: '❌ Search failed.' });

    const data: ISaucenaoSearchResponse = response.data;

    if (data.header?.status !== 0) return editOrReplyThenDelete(interaction, { content: `❌ ${data.header?.message}` });

    if (data.results?.length === 0) return editOrReplyThenDelete(interaction, { content: `❌ No result found.` });

    data.results = data.results?.filter(
      (result: ISaucenaoSearchResponseResult) =>
        parseFloat(result.header?.similarity!) > data.header?.minimum_similarity!,
    );

    if (data.results?.length === 0)
      return editOrReplyThenDelete(interaction, { content: `❌ The results' similarity is too low.` });

    const pages = data.results!.map((result: ISaucenaoSearchResponseResult, index: number) => {
      const embed = SauceNAOResultEmbed(interaction.user, result, index + 1, data.results!.length);

      return { embeds: [embed] };
    });

    const pagination = commonPagination(interaction, pages, CommonConstants.PAGINATION_TYPE.BUTTON, false);
    return await pagination.send();
  }
}
