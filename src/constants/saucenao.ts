export default class SauceNAOConstants {
  public static readonly REGEX_DOMAIN_NAME_ONLY = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/;

  /* SauceNAO */
  public static readonly REGEX_IMAGE_URL =
    /^(https?:\/\/)?(?:[a-z0-9\-]+\.)+[a-z]{2,}(?:\/[^\/]+)*\/[^\/]+(\.(?:jpe?g|gif|png|webp)?:format=jpg)(?:\?.*)?$/i;
  public static readonly SAUCENAO_API = 'https://saucenao.com/search.php';
  public static readonly SAUCENAO_LOGO =
    'https://f-droid.org/repo/com.luk.saucenao/en-US/icon_hchmnK2H6QtbwWR4cV6mtdp_7xBJ7eSdIiulErczfOc=.png';
  public static readonly SAUCENAO_SOURCES = {
    3: 'DoujinMangaLexicon',
    4: 'DoujinMangaLexicon',
    5: 'Pixiv',
    6: 'Pixiv',
    8: 'NicoNicoSeiga',
    9: 'Danbooru',
    10: 'Drawr',
    11: 'Nijie',
    12: 'Yandere',
    13: 'OpeningsMoe',
    16: 'Fakku',
    18: 'NHentai',
    19: 'TwoDMarket',
    20: 'MediBang',
    21: 'AniDB',
    22: 'AniDB',
    23: 'IMDb',
    24: 'IMDb',
    25: 'Gelbooru',
    26: 'Konachan',
    27: 'SankakuChannel',
    28: 'AnimePictures',
    29: 'E621',
    30: 'IdolComplex',
    31: 'bcyIllust',
    32: 'bcyCosplay',
    33: 'PortalGraphics',
    34: 'DeviantArt',
    35: 'Pawoo',
    36: 'MangaUpdates',
    37: 'MangaDex',
    371: 'MangaDex',
    38: 'H-Misc (ehentai)',
    39: 'ArtStation',
    40: 'FurAffinity',
    41: 'Twitter',
    42: 'FurryNetwork',
    43: 'Kemono',
    44: 'Skeb',
  };
}
