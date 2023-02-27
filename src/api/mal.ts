import { Get, Router } from '@discordx/koa';
import axios from 'axios';
import { Guild, GuildMember } from 'discord.js';
import type { Context } from 'koa';
import qs from 'qs';
import { Constants } from '../constants/constants.js';
import { bot } from '../main.js';
import { authApi } from '../services/mal.js';

@Router()
export class MAL_API {
  @Get('/mal-callback')
  async auth(context: Context): Promise<any> {
    const auth_code = context.query.code as string;
    const state = context.query.state as string | undefined;
    const guildId = state!.split('_')[0].trim();
    const userId = state!.split('_')[1].trim();

    if (!auth_code) return context.throw(400, 'invalid auth code');

    const guild: Guild | undefined = bot.guilds.cache.get(guildId);
    const user: GuildMember | undefined = guild?.members.cache.get(userId);

    if (!user) return context.throw(400, 'invalid user/guild');

    const pkce = await authApi.getPKCE(user);

    const data = {
      client_id: process.env.MAL_CLIENT_ID,
      client_secret: process.env.MAL_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: auth_code,
      code_verifier: pkce?.codeChallenge,
    };

    const resToken = await axios({
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(data),
      url: `${Constants.MAL_AUTH_API}/token`,
    });

    const userAuth = await authApi.saveToken(user!, resToken.data.access_token, resToken.data.refresh_token);

    if (!userAuth) return (context.body = 'Login failed, please close this tab and try again.');

    user.send('MAL login successfully!');

    return (context.body = 'Login succeed, you can close this tab now.');
  }
}
