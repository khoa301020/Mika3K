from asyncio import sleep

async def genshin_sleep(ctx,time):
    await sleep(time)
    await ctx.send(f'{ctx.author.mention} time to login Genshin!')