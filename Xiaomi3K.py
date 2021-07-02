import datetime
from datetime import datetime, timezone, timedelta

timezone_offset = +7.0
tzinfo = timezone(timedelta(hours=timezone_offset))

import discord
import datetime


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

    await ctx.send("Next login: " + str(datetime_to_login.strftime('%d/%m/%Y %H:%M:%S')))

bot.run('ODYwNDc0Nzk5ODQ3MTEyNzM1.YN7xmw.mG4wfZ0J6eQFQcgQ8QFVjk_wR-E')