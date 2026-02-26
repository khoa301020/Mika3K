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
    context.body = `<!DOCTYPE html>
    <html>
    
    <head>
      <title>${bot.user?.displayName}</title>
      <style>
        body {
          margin: 0px;
        }
    
        strong {
          color: #fff;
        }
    
        span {
          font-size: 200%;
        }
    
        .container {
          background-image: url("https://raw.githubusercontent.com/khoa301020/Xiaomi3K/main/src/resources/images/bg.png");
          height: 100vh;
        }
    
        .serifu {
          font-size: 300%;
          text-align: left;
          color: #888888;
          writing-mode: vertical-rl;
          display: none;
          height: 100vh;
          margin: auto;
        }
      </style>
    
      <script>
        window.onload = function () {
          var serifu = document.getElementsByClassName("serifu");
          serifu[0].style.display = "block";
          var i = 1;
          var interval = setInterval(function () {
            serifu[i >= 1 ? i - 1 : serifu.length - 1].style.display = "none";
            serifu[i].style.display = "block";
            i++;
            if (i >= serifu.length) {
              i = 0;
            }
          }, 5000);
        }
      </script>
    </head>
    
    <body>
      <div class="container">
        <h1 class="serifu" id="first">「あなたの<br>　せいじゃないよ、■■■」</h1>
        <h1 class="serifu" id="second">「︙︙責任は、私が負うからね」</h1>
        <h1 class="serifu" id="third">「それが、　<br>　<span><strong>大人</strong>の</span><br>　やるべきことだから」</h1>
        <h1 class="serifu" id="fourth">「君がなりたい<strong>存在</strong>は、<br>　<span><strong>君自身が決め</strong>て</span><br>　いいんだよ――」
        </h1>
        <h1 class="serifu" id="fifth">「生徒たち自身が<br>　心から願う<strong>夢</strong>を」</h1>
        <h1 class="serifu" id="sixth">「いつも<br>　頑張ってくれて<br>　<strong>ありがとうって</strong>」</h1>
        <h1 class="serifu" id="seventh">「ミカは<strong>魔女じゃない</strong>よ」</h1>
        <h1 class="serifu" id="eighth">「いってらっしゃい、<br>　いざという時は<br>　<span><strong>責任</strong>取るから</span>」</h1>
        <h1 class="serifu" id="ninth">「――この先に続く未来には、<br>　<span><strong>無限の可能性</strong>が</span><br>　あるんだから」</h1>
      </div>
    </body>
    
    </html>`;
  }

  @Get('/guilds')
  guilds(context: Context): void {
    context.body = `${bot.guilds.cache.map((g) => `${g.id}: ${g.name}\n`)}`;
  }
}
