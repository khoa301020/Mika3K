import { Get, Router } from '@discordx/koa';
import { RouterContext } from '@koa/router';
import type { Context, Next } from 'koa';
import { bot } from '../main.js';

function Log(ctx: RouterContext, next: Next) {
  console.log('request: ' + ctx.URL);
  return next();
}

@Router()
// @Middleware(Log)
export class API {
  @Get('/')
  index(context: Context): void {
    context.body = `
      <div style="text-align: center">
        <h1>
          <a href="https://discordx.js.org">discord.ts</a> rest api server example
        </h1>
        <p>
          powered by <a href="https://koajs.com/">koa</a> and
          <a href="https://www.npmjs.com/package/@discordx/koa">@discordx/koa</a>
        </p>
      </div>
    `;
  }

  @Get('/guilds')
  guilds(context: Context): void {
    context.body = `${bot.guilds.cache.map((g) => `${g.id}: ${g.name}\n`)}`;
  }
}
