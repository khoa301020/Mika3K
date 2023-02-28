import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  InteractionResponse,
  MessageActionRowComponentBuilder,
} from 'discord.js';
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx';
import qs from 'qs';
import { Constants } from '../../constants/constants.js';
import { codeChallenge } from '../../helpers/helper.js';
import { MAL_UserEmbed } from '../../providers/embeds/malEmbed.js';
import { authApi, userApi } from '../../services/mal.js';
import { IUser } from '../../types/mal.js';

@Discord()
@SlashGroup({ description: 'mal-commands', name: 'mal' })
export class MAL_User {
  @SlashGroup('mal')
  @Slash({ description: 'Login MAL', name: 'login' })
  async login(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
    const userId = interaction.user.id;
    const PKCE = codeChallenge;
    const clientId = process.env.MAL_CLIENT_ID;
    const state = `${interaction.guildId}_${interaction.user.id}`;

    const data = {
      client_id: clientId,
      response_type: 'code',
      state: state,
      code_challenge: PKCE,
      redirect_uri: process.env.MAL_CALLBACK_URL,
    };

    const authUrl = `${Constants.MAL_AUTH_API}/authorize?${qs.stringify(data)}`;

    const authBtn = new ButtonBuilder().setLabel('Authorization URL').setStyle(ButtonStyle.Link).setURL(authUrl);

    const authRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(authBtn);

    await authApi.savePKCE(userId!, PKCE);

    return interaction.reply({ content: 'Please authorize:', components: [authRow], ephemeral: true });
  }

  @SlashGroup('mal')
  @Slash({ description: 'MAL my info', name: 'my-info' })
  async myinfo(
    @SlashOption({
      description: 'Public display?',
      name: 'display',
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    display: Boolean,
    interaction: CommandInteraction,
  ): Promise<any> {
    await interaction.deferReply({ ephemeral: !display });
    const userId = interaction.user.id;

    const user = await authApi.checkAuthorized(userId);

    if (!user)
      return interaction.editReply({
        content: 'Your login session is expired or not authorized.\nPlease login.',
      });

    const response = await userApi.getSelf(user.accessToken!);
    const userData: IUser = response.data;

    const embed = MAL_UserEmbed(userData, interaction.user);

    return interaction.editReply({ embeds: [embed] });
  }
}
