import discord
from datetime import datetime, timezone, timedelta
from NHentai.base_wrapper import Doujin

from discord.ext import commands

timezone_offset = +7.0
tzinfo = timezone(timedelta(hours=timezone_offset))


def get_doujin_info(doujin: Doujin):
    title = "Title: [{0}](https://nhentai.net/g/{1})\n".format(
        f"{doujin.title}", doujin.id)
    parody = "Parodies: {0}\n".format(doujin.parodies)
    char = "Characters: {0}\n".format(doujin.characters)
    artist = "Artist: {0}\n".format(doujin.artists)
    tag = "Tags: {0}\n".format(doujin.tags)
    group = "Groups: {0}\n".format(doujin.groups)
    category = "Categories: {0}\n".format(doujin.categories)
    language = "Languages: {0}\n".format(doujin.languages)
    page = "Pages: {0}\n".format(doujin.total_pages)

    body = ''.join(parody+char+artist+tag+group+category+language+page).replace('[', '').replace(']', '').replace('\'', '').replace('*', '\\*')

    desc = ''.join(title+body)
    return desc


def create_embed_doujin(ctx: commands.context.Context, doujin: Doujin) -> discord.Embed:
    embed = discord.Embed(
        title=f"Nuke code: {doujin.id}", description=get_doujin_info(doujin), color=0x00ff00)
    embed.set_thumbnail(url=doujin.images[0])
    embed.set_footer(icon_url=ctx.author.avatar_url,
                     text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}")
    return embed
