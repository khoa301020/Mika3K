import Xiaomi3K_functions
import random
import discord
import datetime
import re
import os
from NHentai.nhentai import NHentai
from asyncio import sleep
from discord.ext import commands
from datetime import datetime, timezone, timedelta

nhentai = NHentai()

timezone_offset = +7.0
tzinfo = timezone(timedelta(hours=timezone_offset))


bot = commands.Bot(command_prefix='$')
token = os.getenv("TOKEN")


@bot.command(aliases=['lt'])
async def logintime(ctx, resin_now: int, resin_needed: int):
    resin_left = resin_needed - resin_now
    time_left = timedelta(minutes=8*resin_left)
    datetime_to_login = datetime.now(tzinfo) + time_left

    if (resin_now < 0) or (resin_needed < 0) or (resin_now >= resin_needed):
        await ctx.send(f"{ctx.message.author.mention} syntax error!")
        return

    def check(reaction, user):
        return user == ctx.message.author and (str(reaction.emoji) == "<:NierOk:858307590215696404>" or str(reaction.emoji) == "<:NierUpupu:858311607524261919>")

    bot_msg = await ctx.send(f"{ctx.message.author.mention} Next login: {datetime_to_login.strftime('%d/%m/%Y %H:%M:%S')}, wanna ping?")
    await bot_msg.add_reaction("<:NierOk:858307590215696404>")
    await bot_msg.add_reaction("<:NierUpupu:858311607524261919>")
    reaction, user = await bot.wait_for('reaction_add', timeout=60.0, check=check)

    if str(reaction.emoji) == "<:NierOk:858307590215696404>":
        await ctx.send(f'Roger!')
        await bot_msg.clear_reactions()
        await sleep((datetime_to_login-datetime.now(tzinfo)).total_seconds())
        await ctx.send(f'{ctx.author.mention} time to login Genshin!')
    else:
        await ctx.send(f'Kay, I won\'t ping you.')
        await bot_msg.clear_reactions()


@bot.command()
async def math(ctx, *, message):
    message_desc = message.replace('\\', '')
    message_title = re.sub(r'([^a-zA-Z0-9_ ])', r'\\\1', message_desc)
    print(message)
    try:
        embed_var = discord.Embed(
            title=message_title, description=f"= {eval(message_desc)}", color=0x00ff00)
        await ctx.send(embed=embed_var)
    except:
        await ctx.send(f"{ctx.author.mention} Syntax error")


@bot.command()
async def ping(ctx):
    emo_dict = {range(1, 50): "<:NierWow:858307590182141962>",
                range(51, 100): "<:NierOk:858307590215696404>",
                range(101, 200): "<:NierUpupu:858311607524261919>",
                range(201, 300): "<:NierSleep:858311608810864650>",
                range(301, 1000): "<:NierStare:858307590148980736>",
                range(1001, 10000000): "<:NierCri:858311607302094870>"}

    pinging_embed = discord.Embed(
        title=f"Pinging...", description=f"Chotto a minute...", color=0x00ff00)
    t = await ctx.send(embed=pinging_embed)
    ping = round((t.created_at-ctx.message.created_at).total_seconds() * 1000)
    result_embed = discord.Embed(
        title=f"Pong! {[emo_dict[key] for key in emo_dict if ping in key][0]}", description=f"{ping}ms", color=0x00ff00)
    await t.edit(embed=result_embed)


@bot.command()
async def pong(ctx):
    await ctx.send(f'Pong! in {round(bot.latency * 1000)}ms')


@bot.command()
async def pick(ctx, *, message):
    try:
        list_choices = message.split(',')
        embed = discord.Embed(
            title="I pick...", description=f"{random.choice(list_choices)}", color=0x00ff00)
        await ctx.send(embed=embed)
    except:
        await ctx.send("There's nothing to choose...")


@bot.command()
async def say(ctx, *, message):
    await ctx.send(f"{message}")


@bot.command()
async def sayd(ctx, *, message):
    await ctx.message.delete()
    await ctx.send(f"{message}")


@bot.command(aliases=['nhc'])
async def nhcode(ctx, *, message):
    list_hentoi = message.split(' ')
    for hentoi in list_hentoi:
        doujin = nhentai.get_doujin(id=hentoi)
        embed = Xiaomi3K_functions.create_embed_doujin(ctx, doujin)
        await ctx.send(embed=embed)


@bot.command(aliases=['nhr'])
async def nhrandom(ctx):
    doujin = nhentai.get_random()
    embed = Xiaomi3K_functions.create_embed_doujin(ctx, doujin)
    await ctx.send(embed=embed)
    

@bot.command(aliases=['nhs'])
async def nhsearch(ctx, *, message):
    sort_dict = {'all': 'popular', 'day': 'popular-today', 'week': 'popular-week'}
    page = message.split(
        ' ')[-1].isnumeric() and int(message.split(' ')[-1]) or None
    if page:
        message = message.rsplit(' ', 1)[0]
    sort = message.split(
        ' ')[-1] in sort_dict and sort_dict.get(message.split(' ')[-1]) or None
    if sort:
        message = message.rsplit(' ', 1)[0]
    query = message

    doujin_list = nhentai.search(query=query, sort=sort, page=page)
    id_list = [i.id for i in doujin_list.doujins]
    index = 0
    doujin = nhentai.get_doujin(id=id_list[index])
    embed = Xiaomi3K_functions.create_embed_doujin(ctx, doujin)
    embed.set_footer(
        text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}  •  {index+1}/{len(id_list)}")
    bot_msg = await ctx.send(embed=embed)
    await bot_msg.add_reaction('⏪')
    await bot_msg.add_reaction('⏩')

    def check(reaction, user):
        return user == ctx.message.author and (str(reaction.emoji) == '⏪' or str(reaction.emoji) == '⏩')
    while True:
        try:
            reaction, user = await bot.wait_for('reaction_add', timeout=60.0, check=check)
            if reaction.emoji == '⏪':
                index = index == 0 and 0 or index - 1
                doujin = nhentai.get_doujin(id=id_list[index])
                embed = Xiaomi3K_functions.create_embed_doujin(ctx, doujin)
                embed.set_footer(
                    text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}  •  {index+1}/{len(id_list)}")
                await bot_msg.edit(embed=embed)
                await bot_msg.remove_reaction('⏪', user)

            if reaction.emoji == '⏩':
                index = index == len(id_list)-1 and len(id_list)-1 or index + 1
                doujin = nhentai.get_doujin(id=id_list[index])
                embed = Xiaomi3K_functions.create_embed_doujin(ctx, doujin)
                embed.set_footer(
                    text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}  •  {index+1}/{len(id_list)}")
                await bot_msg.edit(embed=embed)
                await bot_msg.remove_reaction('⏩', user)
        except:
            await bot_msg.clear_reactions()
            break


@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(f"{ctx.author.mention} A parameter is missing!")

bot.run(token)
