import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  InteractionResponse,
  MessageActionRowComponentBuilder,
} from 'discord.js';
import { Discord, Slash, SlashGroup } from 'discordx';
import qs from 'qs';
import { Constants } from '../../constants/constants.js';
import { codeChallenge } from '../../helpers/helper.js';
import { authApi } from '../../services/mal.js';

@Discord()
@SlashGroup({ description: 'mal-commands', name: 'mal' })
export class MAL_Login {
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
}
