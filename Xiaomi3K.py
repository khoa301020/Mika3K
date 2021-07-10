import Xiaomi3K_functions
import Xiaomi3K_asyncio_sleep
import random
import discord
import datetime
import re
import requests
import os
import traceback
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
        await Xiaomi3K_asyncio_sleep.genshin_sleep(ctx, (datetime_to_login-datetime.now(tzinfo)).total_seconds())
    else:
        await ctx.send(f'Kay, I won\'t ping you.')
        await bot_msg.clear_reactions()


@bot.command()
async def math(ctx, *, message):
    message_desc = message.replace('\\', '')
    message_title = re.sub(r'([^a-zA-Z0-9_ ])', r'\\\1', message_desc)
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
    sort_dict = {'all': 'popular',
                 'day': 'popular-today', 'week': 'popular-week'}
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
                index -= 1 if index != 0 else 0
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
            print(traceback.format_exc())
            await bot_msg.clear_reactions()
            break


@bot.command(aliases=['gs'])
async def gelsearch(ctx, *, message):
    booru = await Xiaomi3K_functions.get_gelbooru(message)
    if not booru:
        await ctx.send("Found nothing...")
        return

    index = 0

    embed = Xiaomi3K_functions.create_embed_gelbooru(ctx, booru[0])
    embed.set_footer(
        text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}  •  {index+1}/{len(booru)}")
    bot_msg = await ctx.send(embed=embed)
    await bot_msg.add_reaction('⏪')
    await bot_msg.add_reaction('⏩')

    def check(reaction, user):
        return user == ctx.message.author and (str(reaction.emoji) == '⏪' or str(reaction.emoji) == '⏩') and reaction.message == bot_msg
    while True:
        try:
            reaction, user = await bot.wait_for('reaction_add', timeout=60.0, check=check)
            if reaction.emoji == '⏪':
                index -= 1 if index != 0 else 0
                embed = Xiaomi3K_functions.create_embed_gelbooru(
                    ctx, booru[index])
                embed.set_footer(
                    text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}  •  {index+1}/{len(booru)}")
                await bot_msg.edit(embed=embed)
                await bot_msg.remove_reaction('⏪', user)

            if reaction.emoji == '⏩':
                index = index == len(booru)-1 and len(booru)-1 or index + 1
                embed = Xiaomi3K_functions.create_embed_gelbooru(
                    ctx, booru[index])
                embed.set_footer(
                    text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}  •  {index+1}/{len(booru)}")
                await bot_msg.edit(embed=embed)
                await bot_msg.remove_reaction('⏩', user)
        except:
            print(traceback.format_exc())
            await bot_msg.clear_reactions()
            break


@bot.command(aliases=['ava'])
async def avatar(ctx, member: discord.Member = None):
    if not member:
        member = ctx.author
    userAvatarUrl = [member] and member.avatar_url or ctx.author.avatar_url
    embed = discord.Embed(title=str(member), color=0x00ff00)
    embed.set_image(url=userAvatarUrl)
    await ctx.send(embed=embed)


@bot.command(aliases=['2x'])
async def waifu2x(ctx):
    url = ctx.message.attachments[0].url
    r = requests.post(
        "https://api.deepai.org/api/waifu2x",
        data={
            'image': url,
        },
        headers={'api-key': '2d31a1a0-ce6c-4159-9363-ab8ee0264882'}
    )
    await ctx.send(r.json()['output_url'])


@bot.command(aliases=['sn'])
async def saucenao(ctx):
    url = ctx.message.attachments[0].url
    sauce = Xiaomi3K_functions.get_saucenao(url)
    if not sauce:
        await ctx.send("Found nothing...")
        return

    index = 0

    embed = Xiaomi3K_functions.create_embed_saucenao(sauce[0])
    embed.set_footer(
        text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}  •  {index+1}/{len(sauce)}")
    bot_msg = await ctx.send(embed=embed)
    await bot_msg.add_reaction('⏪')
    await bot_msg.add_reaction('⏩')

    def check(reaction, user):
        return user == ctx.message.author and (str(reaction.emoji) == '⏪' or str(reaction.emoji) == '⏩') and reaction.message == bot_msg
    while True:
        try:
            reaction, user = await bot.wait_for('reaction_add', timeout=60.0, check=check)
            if reaction.emoji == '⏪':
                index -= 1 if index != 0 else 0
                embed = Xiaomi3K_functions.create_embed_saucenao(
                    sauce[index])
                embed.set_footer(
                    text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}  •  {index+1}/{len(sauce)}")
                await bot_msg.edit(embed=embed)
                await bot_msg.remove_reaction('⏪', user)

            if reaction.emoji == '⏩':
                index = index == len(sauce)-1 and len(sauce)-1 or index + 1
                embed = Xiaomi3K_functions.create_embed_saucenao(
                    sauce[index])
                embed.set_footer(
                    text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}  •  {index+1}/{len(sauce)}")
                await bot_msg.edit(embed=embed)
                await bot_msg.remove_reaction('⏩', user)
        except:
            print(traceback.format_exc())
            await bot_msg.clear_reactions()
            break


@bot.command(aliases=['yd'])
async def yandex(ctx):
    url = ctx.message.attachments[0].url
    yandex = Xiaomi3K_functions.get_soup_yandex(url)
    if not yandex:
        await ctx.send("Found nothing...")
        return

    index = 0

    embed = Xiaomi3K_functions.create_embed_yandex(yandex[0])
    embed.set_footer(
        text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}  •  {index+1}/{len(yandex)}")
    bot_msg = await ctx.send(embed=embed)
    await bot_msg.add_reaction('⏪')
    await bot_msg.add_reaction('⏩')

    def check(reaction, user):
        return user == ctx.message.author and (str(reaction.emoji) == '⏪' or str(reaction.emoji) == '⏩') and reaction.message == bot_msg
    while True:
        try:
            reaction, user = await bot.wait_for('reaction_add', timeout=60.0, check=check)
            if reaction.emoji == '⏪':
                index -= 1 if index != 0 else 0
                embed = Xiaomi3K_functions.create_embed_yandex(
                    yandex[index])
                embed.set_footer(
                    text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}  •  {index+1}/{len(yandex)}")
                await bot_msg.edit(embed=embed)
                await bot_msg.remove_reaction('⏪', user)

            if reaction.emoji == '⏩':
                index = index == len(yandex)-1 and len(yandex)-1 or index + 1
                embed = Xiaomi3K_functions.create_embed_yandex(
                    yandex[index])
                embed.set_footer(
                    text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}  •  {index+1}/{len(yandex)}")
                await bot_msg.edit(embed=embed)
                await bot_msg.remove_reaction('⏩', user)
        except:
            print(traceback.format_exc())
            await bot_msg.clear_reactions()
            break


@bot.command(aliases=['cv'])
async def convert(ctx, input, output, *, msg):
    base_dict = {'bin': 2, 'oct': 8, 'dec': 10, 'hex': 16, 'text': 'ASCII'}
    if input not in base_dict or output not in base_dict:
        await ctx.send("Arguments invalid!")
        return
    try:
        var_input = input != 'text' and int(msg, base_dict.get(
            input)) or ''.join([str(ord(i)) for i in msg])
        if output == 'text':
            var_output = bytes.fromhex(str(hex(var_input))[2:]).decode('ASCII')
        elif output == 'bin':
            var_output = str(bin(var_input))[2:]
        elif output == 'oct':
            var_output = str(oct(var_input))[2:]
        elif output == 'dec':
            var_output = var_input
        else:
            var_output = str(hex(var_input))[2:]
        await ctx.send(embed=discord.Embed(title="Convert succeed!", description="Input: {0}\nOutput: {1}".format(msg, var_output)))
    except:
        print(traceback.format_exc())
        await ctx.send("Input invalid!")
        return


@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(f"{ctx.author.mention} A parameter is missing!")

bot.run(token)
# bot.run('ODYxODk3MjMzNjM2NjU1MTI0.YOQeWQ.z2P1wuFK8La5VGsSg7udSkmv3g0')  # Klee
# bot.run('ODYwNDc0Nzk5ODQ3MTEyNzM1.YN7xmw.Dx2j_VDmG52omKVvqTUVlPl0KQs') # Xiaomi3K
