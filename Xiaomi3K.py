import datetime
from datetime import datetime, timezone, timedelta

timezone_offset = +7.0
tzinfo = timezone(timedelta(hours=timezone_offset))

import discord
import datetime
from asyncio import sleep


from discord.ext import commands

bot = commands.Bot(command_prefix='$')

@bot.command()
async def time(ctx):
    msg = str(ctx.message.content).split(' ')
    argv = msg[1:]
    resin_now = int(argv[0])
    resin_needed = int(argv[1])
    resin_left = resin_needed - resin_now
    time_left = datetime.timedelta(minutes = 8*resin_left)
    datetime_to_login = datetime.datetime.now(tzinfo) + time_left    

    if (resin_now < 0) or (resin_needed < 0) or (resin_now >= resin_needed):
        await ctx.send(f"{ctx.message.author.mention} syntax error!")
        return

    if ctx.author.id == 680927590101286962:
        def check(reaction, user):
            return user == ctx.message.author and (str(reaction.emoji) == "<:Worry:844849143163256842>" or str(reaction.emoji) == "<:WorryBack:851770707998015508>")

        bot_msg = await ctx.send(f"{ctx.message.author.mention} Next login: {str(datetime_to_login.strftime('%d/%m/%Y %H:%M:%S'))}, wanna eat noodles?")
        await bot_msg.add_reaction("<:Worry:844849143163256842>")
        await bot_msg.add_reaction("<:WorryBack:851770707998015508>")
        reaction, user = await bot.wait_for('reaction_add', timeout=60.0, check=check)

        if str(reaction.emoji) == "<:Worry:844849143163256842>":
            await ctx.send(f'Kay, I\'m gonna boil some water then.')
            await bot_msg.clear_reactions()
            await sleep((datetime_to_login-datetime.datetime.now(tzinfo)).total_seconds())
            await ctx.send(f'{ctx.author.mention} time to eat noodles!')
        else:
            await ctx.send(f'Kay, I\'ll eat alone then.')
            await bot_msg.clear_reactions()
    else:
        def check(reaction, user):
            return user == ctx.message.author and (str(reaction.emoji) == "<:NierOk:858307590215696404>" or str(reaction.emoji) == "<:NierUpupu:858311607524261919>")

        bot_msg = await ctx.send(f"{ctx.message.author.mention} Next login: {str(datetime_to_login.strftime('%d/%m/%Y %H:%M:%S'))}, wanna ping?")
        await bot_msg.add_reaction("<:NierOk:858307590215696404>")
        await bot_msg.add_reaction("<:NierUpupu:858311607524261919>")
        reaction, user = await bot.wait_for('reaction_add', timeout=60.0, check=check)

        if str(reaction.emoji) == "<:NierOk:858307590215696404>":
            await ctx.send(f'Roger!')
            await bot_msg.clear_reactions()
            await sleep((datetime_to_login-datetime.datetime.now(tzinfo)).total_seconds())
            await ctx.send(f'{ctx.author.mention} time to login Genshin!') 
        else:
            await ctx.send(f'Kay, I won\'t ping you.')
            await bot_msg.clear_reactions()

@bot.command()
async def math(ctx,*,message):
    print(message)
    try:
        embed_var = discord.Embed(title = message, description = f"= {eval(message)}", color=0x00ff00)
        await ctx.send(embed = embed_var)
    except:
        await ctx.send(f"{ctx.author.mention} Syntax error")


bot.run('ODYwNDc0Nzk5ODQ3MTEyNzM1.YN7xmw.Dx2j_VDmG52omKVvqTUVlPl0KQs')