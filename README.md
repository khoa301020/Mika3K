# Introduction

My multi-purposes self-use discord bot, rewritten in **NestJS** and **Necord**.

Default prefix: `$`. Change the prefix in `.env` file, key: `BOT_PREFIX`.
# Commands

## MyAnimeList

|   Group   | Feature                                                                                                 | Context menu |    Prefix command       |
|:---------:|----------------------------------------------------------------------------------------------------------|:------------:|:-----------------------:|
|   Anime   | Search anime (with `show characters`, `show episodes`, `show staffs`, `show themes` & `show statistics`) |      :x:     |   `.mal anime search`   |
|   Manga   | Search manga (with `show characters` & `show statistics`)                                                |      :x:     | `.mal manga search`     |
| Character | Search character                                                                                         |      :x:     | `.mal character search` |
|   People  | Search people                                                                                            |      :x:     | `.mal people search`    |

## Blue Archive

| Feature                                                                                        | Context menu |      Prefix command      |
|------------------------------------------------------------------------------------------------|:------------:|:------------------------:|
| Check server status                                                                            |      :x:     | `.buruaka server-status` |
| Search student (with `show profile`, `show stats`, `show skills`, `show weapon` & `show gear`) |      :x:     |    `.buruaka student`    |
| Search raid                                                                                    |      :x:     |      `.buruaka raid`     |
| SchaleDB update notify                                                                         |      :x:     |          `.bant`         |

## NHentai

|     Feature    |     Context menu     |    Prefix command  |
|:--------------:|:--------------------:|:------------------:|
| Check nuke     |          :x:         |  `.nhentai check`  |
| Search nuke    |  :heavy_check_mark:  |  `.nhentai search` |
| Random nuke    |          :x:         |  `.nhentai random` |
| Set autoview   |          :x:         |  `.nh-autoview`    |

## Syosetu

|         Feature        | Context menu |    Prefix command  |
|:----------------------:|:------------:|:------------------:|
|     Search novels      |      :x:     |  `.syosetu search` |
|      List genres       |      :x:     |  `.syosetu genres` |
| Follow/unfollow novel  |      :x:     |  `.syosetu follow` |

## HoYoLAB

|                  Feature                 | Context menu |       Prefix command       |
|:----------------------------------------:|:------------:|:--------------------------:|
| My info                                  |      :x:     |       `.hoyolab info`      |
| Get note (current status)                |      :x:     |       `.hoyolab note`      |
| Save token (with account selection)      |      :x:     |    `.hoyolab save-token`   |
| Redeem giftcode                          |      :x:     | `.hoyolab redeem-giftcode` |
| Delete remark user                       |      :x:     |  `.hoyolab delete-remark`  |

## Quote

|    Feature    |    Context menu    |   Prefix command |
|:-------------:|:------------------:|:----------------:|
| Create quote  | :heavy_check_mark: |  `.quote create` |
| Get quote     |         :x:        |   `.quote get`   |
| Edit quote    |         :x:        |   `.quote edit`  |
| Delete quote  |         :x:        |  `.quote delete` |
| List quotes   |         :x:        |   `.quote list`  |
| My quotes     |         :x:        |   `.quote mine`  |
| Publish quote |         :x:        | `.quote publish` |
| Private quote |         :x:        | `.quote private` |

## Minigames

|                Feature                | Context menu |       Prefix command      |
|:-------------------------------------:|:------------:|:-------------------------:|
| Play jankenpon (rock, scissor, paper) |      :x:     |   `.minigame jankenpon`   |

## Misc

|        Feature        |    Context menu    |     Prefix command    |
|:---------------------:|:------------------:|:---------------------:|
| Check user info       | :heavy_check_mark: |     `.check-info`     |
| SauceNAO              | :heavy_check_mark: |      `.saucenao`      |
| Math                  |         :x:        |     `.math`           |
| Currency exchange     |         :x:        | `.currency-exchange`  |
| Twitter embed support |         :x:        |          :x:          |
| Tiktok/Pixiv autoview |         :x:        |          :x:          |
| Help Menu             |         :x:        |        `.help`        |

# Resources

- MyAnimeList API by [Jikan](https://github.com/jikan-me/jikan)
- Blue Archive data from [@lonqie/SchaleDB](https://github.com/lonqie/SchaleDB)
- Pixiv API integration via HibiAPI

# Dependencies

- [NestJS](https://nestjs.com)
- [Necord](https://necord.org)
- [Discord.js](https://discord.js.org)
- [Mongoose](https://mongoosejs.com)
- [Axios](https://axios-http.com)
- [Day.js](https://day.js.org)

# License

MIT License

Copyright (c) 2023-2026 Nguyen Tran Anh Khoa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.