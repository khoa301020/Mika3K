import saucenao_api
from Xiaomi3K import saucenao
import discord
import pygelbooru
from datetime import datetime, timezone, timedelta
from NHentai.base_wrapper import Doujin
from saucenao_api import SauceNao
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

    body = ''.join(parody+char+artist+tag+group+category+language+page).replace(
        '[', '').replace(']', '').replace('\'', '').replace('*', '\\*')

    desc = ''.join(title+body)
    return desc


def create_embed_doujin(ctx: commands.context.Context, doujin: Doujin) -> discord.Embed:
    embed = discord.Embed(
        title=f"Nuke code: {doujin.id}", description=get_doujin_info(doujin), color=0x00ff00)
    embed.set_thumbnail(url=doujin.images[0])
    embed.set_footer(icon_url=ctx.author.avatar_url,
                     text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}")
    return embed


async def get_gelbooru(message: str):
    rating_dict = {'e': 'rating:explicit',
                   's': 'rating:safe',
                   'q': 'rating:questionable'}
    message = message.split(';')
    rating = rating_dict.get(message[3])
    limit = message[2].isnumeric() and int(message[2]) or 100
    excluded = message[1]
    tags = rating and message[0].split(',')+[rating] or message[0].split(',')
    gelbooru = pygelbooru.Gelbooru(
        '0f049087f90fcf2543c99f81b56588b21896a7545b6be7a2a5192643d7d90667', '810736')
    results = await gelbooru.search_posts(tags=tags, exclude_tags=excluded, limit=limit)
    return results


def create_embed_gelbooru(ctx: commands.context.Context, booru: pygelbooru.gelbooru.GelbooruImage) -> discord.Embed:
    embed = discord.Embed(
        title=f"ID: {booru.id}", description=f"Tags: `{'` `'.join(booru.tags[1:-1])}`", color=0x00ff00)
    embed.set_image(url=str(booru))
    embed.add_field(name="Image Url", value=str(booru))
    embed.set_footer(icon_url=ctx.author.avatar_url,
                     text=f"{ctx.author}  •  {datetime.strptime(str(ctx.message.created_at),'%Y-%m-%d %H:%M:%S.%f').astimezone(tzinfo).strftime('%d/%m/%Y %H:%M:%S')}")
    return embed

def get_saucenao_desc(sauce:saucenao_api.BasicSauce) -> str:
    title = sauce.title + '\n'
    similarity = str(sauce.similarity) + '%\n'
    author = [sauce.author] and sauce.author + '\n' or ''
    desc = ''.join(title+similarity+author)
    return desc

def get_saucenao_source(sauce:saucenao_api.BasicSauce) -> str:
    urls = sauce.urls
    if not urls:
        return ''
    list_source = [i.replace('www.','').split('/')[2].split('.')[0] for i in urls]
    source = ''.join(["[{0}]({1})\n".format(list_source[i],urls[i]) for i in range(len(urls))])    
    return source

def create_embed_saucenao(sauce:saucenao_api.BasicSauce) -> discord.Embed:
    print(sauce.urls)
    embed = discord.Embed(title = sauce.index_name, description = get_saucenao_desc(sauce))
    embed.set_image(url=sauce.thumbnail)
    embed.add_field(name="Source:",value=get_saucenao_source(sauce))

    return embed