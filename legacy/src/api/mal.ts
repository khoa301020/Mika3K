import { Get, Router } from '@discordx/koa';
import { Guild, GuildMember } from 'discord.js';
import type { Context } from 'koa';
import { bot } from '../main.js';
import { authApi } from '../services/mal.js';
import { datetimeConverter, expireDate } from '../utils/index.js';

@Router()
export class MAL_API {
  @Get('/mal-callback')
  async auth(context: Context): Promise<string> {
    const auth_code = context.query.code as string;
    const state = context.query.state as string | undefined;
    const guildId = state!.split('_')[0].trim();
    const userId = state!.split('_')[1].trim();

    if (!auth_code) return context.throw(400, 'Auth code required in url.');

    const guild: Guild | undefined = bot.guilds.cache.get(guildId);
    const user: GuildMember | undefined = guild?.members.cache.get(userId);

    if (!user) return context.throw(400, 'Invalid user/guild');

    const pkce = await authApi.getPKCE(userId);

    const params = {
      client_id: process.env.MAL_CLIENT_ID,
      client_secret: process.env.MAL_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: auth_code,
      code_verifier: pkce?.codeChallenge,
      redirect_uri: process.env.MAL_CALLBACK_URL,
    };

    const resToken = await authApi.getToken(params);

    if (resToken.status === 401) return context.throw(401, 'Invalid auth code.');

    const accessToken = resToken.data.access_token;
    const refreshToken = resToken.data.refresh_token;
    const expiresDate = expireDate(resToken.data.expires_in);

    const userAuth = await authApi.saveToken(userId!, accessToken, refreshToken, expiresDate);

    if (!userAuth) return (context.body = 'Login failed, please close this tab and try again.');

    user.send(
      `MAL login successfully!\nYour login session will expire at **${
        datetimeConverter(expiresDate).datetime
      } (UTC)**.`,
    );

    return (context.body = 'Login succeed, you can close this tab now.');
  }
}
