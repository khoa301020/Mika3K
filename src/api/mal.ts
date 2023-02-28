import { Get, Router } from '@discordx/koa';
import { Guild, GuildMember } from 'discord.js';
import type { Context } from 'koa';
import { datetimeConverter, expireDate } from '../helpers/helper.js';
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
      redirect_uri: process.env.MAL_CALLBACK_URL,
    };

    const resToken = await authApi.getToken(data);

    const access_token = resToken.data.access_token;
    const refresh_token = resToken.data.refresh_token;
    const expires_date = expireDate(resToken.data.expires_in);

    const userAuth = await authApi.saveToken(user!, access_token, refresh_token, expires_date);

    if (!userAuth) return (context.body = 'Login failed, please close this tab and try again.');

    user.send(
      `MAL login successfully!\nYour login session will expire at **${datetimeConverter(expires_date).datetime}**.`,
    );

    return (context.body = 'Login succeed, you can close this tab now.');
  }
}
