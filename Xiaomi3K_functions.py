import saucenao_api
import discord
import pygelbooru
import requests
import urllib.parse
from bs4 import BeautifulSoup
from NHentai.base_wrapper import Doujin
from saucenao_api import SauceNao
from googleapiclient.discovery import build


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


def create_embed_doujin(doujin: Doujin) -> discord.Embed:
    embed = discord.Embed(
        title=f"Nuke code: {doujin.id}", description=get_doujin_info(doujin), color=0x00ff00)
    embed.set_thumbnail(url=doujin.images[0])
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


def create_embed_gelbooru(booru: pygelbooru.gelbooru.GelbooruImage) -> discord.Embed:
    embed = discord.Embed(
        title=f"ID: {booru.id}", description=f"Tags: `{'` `'.join(booru.tags[1:-1])}`", color=0x00ff00)
    embed.set_image(url=str(booru))
    embed.add_field(name="Image Url", value=str(booru))
    return embed


def get_saucenao(url: str) -> list:
    sauce = SauceNao(api_key='92917bad52b2af15cb878fa34ec419fa9d93b893')
    response = sauce.from_url(url)

    return response.results


def get_saucenao_desc(sauce: saucenao_api.BasicSauce) -> str:
    title = "Title: `" + sauce.title + '`\n'
    similarity = "Similarity: " + str(sauce.similarity) + '%\n'
    author = sauce.author and "Author: " + sauce.author + '\n' or ''
    desc = ''.join(title+similarity+author)
    return desc


def get_saucenao_source(sauce: saucenao_api.BasicSauce) -> str:
    urls = sauce.urls
    if not urls and sauce.index_id != 18:
        return "No source found..."
    list_source = [i.replace('www.', '').split(
        '/')[2].split('.')[0] for i in urls]
    source = ''.join(["[{0}]({1})\n".format(list_source[i], urls[i])
                     for i in range(len(urls))])
    if sauce.index_id == 18:
        id = sauce.thumbnail.split('/')[5].split('%20')[0]
        source = f"NHentai: [{id}](https://nhentai.net/g/{id})"
    return source


def create_embed_saucenao(sauce: saucenao_api.BasicSauce) -> discord.Embed:
    embed = discord.Embed(title=sauce.index_name,
                          description=get_saucenao_desc(sauce))
    embed.set_image(url=sauce.thumbnail)
    embed.add_field(name="Source:", value=get_saucenao_source(sauce))

    return embed


def get_soup_yandex(url: str) -> list:
    req_url = f"https://yandex.com/images/search?rpt=imageview&url={urllib.parse.quote_plus(url)}"
    response = requests.get(req_url)
    soup = BeautifulSoup(response.content, 'html.parser')

    yandex = []

    for i in soup.find_all('li', class_='other-sites__item'):
        source = dict()
        source['thumbnail'] = i.a.get('href')
        source['title'] = i.find_all('div')[2].find_all(
            'div', class_='other-sites__snippet-title')[0].a.get_text()
        source['title_url'] = i.find_all('div')[2].find_all(
            'div', class_='other-sites__snippet-title')[0].a.get('href')
        source['site'] = i.find_all('div')[2].find_all(
            'div', class_='other-sites__snippet-site')[0].a.get_text()
        source['desc'] = i.find_all('div')[2].find_all(
            'div', class_='other-sites__snippet-desc')[0].get_text()
        source['resolution'] = i.a.div.div.get_text()
        yandex.append(source)
    return yandex


def create_embed_yandex(soup) -> discord.Embed:
    embed = discord.Embed(title=f"Site: {soup['site']}",
                          description="Title: [{0}]({1})\nDescription: {2}\nResolution: {3}".format(soup['title'], soup['title_url'], soup['desc'], soup['resolution']))
    embed.set_image(url=soup['thumbnail'])

    return embed


def google_image_search(query):    
    query = urllib.parse.quote_plus(query)
    service = build("customsearch", "v1",
                    developerKey="AIzaSyCgfZ3N__9o5aMREby9GWHYW0HsylnJbL4")
    images = service.cse().list(q=query, cx="c84ec29cbc8e1b019", num=10,
                                searchType="image", filter="1").execute()["items"]
    return images

def create_google_img_embed(img) -> discord.Embed:
    embed = discord.Embed(title=f"Title: {get_site_title(img['displayLink'])} ({img['displayLink']})",
                          description="[{0}]({1})".format(img['title'],img['image']['contextLink']))
    embed.set_image(url=img['link'])
    return embed

def get_site_title(url):
    try:
        response = requests.get("https://" + url)
        soup = BeautifulSoup(response.content, 'html.parser')
        return soup.title.string
    except:
        return url
