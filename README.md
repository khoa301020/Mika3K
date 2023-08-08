# Introduction

My multi-purposes self-use discord bot created with [Discordx](https://discordx.js.org/docs/discordx/getting-started).

Default prefix: `$`. Change the prefix in `.env` file, key: `BOT_PREFIX`.
# Commands

## MyAnimeList

|   Group   | Feature                                                                                                 | Context menu | Message command |      Slash command      |
|:---------:|---------------------------------------------------------------------------------------------------------|:------------:|:---------------:|:-----------------------:|
|   Anime   | Search anime (with `show characters`, `show episodes`, `show staffs`, `show themes` & `show statistics` |      :x:     |       :x:       |   `/mal anime search`   |
|   Manga   | Search manga (with `show characters` & `show statistics`                                                |      :x:     |       :x:       | `/mal manga search`     |
| Character | Search character                                                                                        |      :x:     |       :x:       | `/mal character search` |
|   People  | Search people                                                                                           |      :x:     |       :x:       | `/mal people search`    |

## Blue Archive

| Feature                                                                                       | Context menu | Message command |       Slash command      |
|-----------------------------------------------------------------------------------------------|:------------:|:---------------:|:------------------------:|
| Check server status                                                                           |      :x:     |       :x:       | `/buruaka server-status` |
| Search student (with `show profile`, `show stats`, `show skills`, `show weapon` & `show gear` |      :x:     |       :x:       |    `/buruaka student`    |
| Search raid                                                                                   |      :x:     |       :x:       |      `/buruaka raid`     |

## NHentai

|    Feature   |     Context menu     |    Message command   |   Slash command   |
|:------------:|:--------------------:|:--------------------:|:-----------------:|
| Check nuke   |          :x:         | `$nh` / `$nhentai` |  `/nhentai check` |
| Search nuke  |          :x:         | `$nhs` / `$nhsearch` |  `/nhentai search` |
| Random nuke  |  :heavy_check_mark:  | `$nhrd` / `$nhrandom` |  `/nhentai random` |

## Syosetu

|   Feature  | Context menu |    Message command   |   Slash command   |
|:-----------:|:------------:|:--------------------:|:-----------------:|
| Search novel  |      :x:     |        :x:        |  `/syosetu search` |

## HoYoLAB

|     Feature    | Context menu | Message command |       Slash command       |
|:---------------:|:------------:|:---------------:|:-------------------------:|
|     My info     |      :x:     |       :x:       |      `/hoyolab info`      |
| Save token (with account selection)      |      :x:     |       :x:       |   `/hoyolab save-token`   |
| Redeem giftcode  |      :x:     |       :x:       | `/hoyolab redeem-giftcode` |
| Delete remark user |      :x:     |       :x:       | `/hoyolab delete-remark` |
| Auto claim daily |      :x:     |       :x:       |            :x:           |

## Quote

|    Feature   | Context menu |      Message command     |   Slash command  |
|:-------------:|:------------:|:------------------------:|:----------------:|
| Create quote  |      :x:     |   `$$` / `$createquote`  |  `/quote create` |
| Get quote     |      :x:     |    `$$$` / `$getquote`   |   `/quote get`   |
| Edit quote    |      :x:     |   `$eq` / `$editquote`   |   `/quote edit`  |
| Delete quote  |      :x:     |  `$dq` / `$deletequote`  |  `/quote delete` |
| List quotes   |      :x:     |   `$lq` / `$listquotes`  |   `/quote list`  |
| My quotes     |      :x:     |    `$mq` / `$myquotes`   |   `/quote mine`  |
| Publish quote |      :x:     | `$plq` / `$publishquote` | `/quote publish` |
| Private quote |      :x:     | `$prq` / `$privatequote` | `/quote private` |

## Minigames

|                Feature               | Context menu |     Message command     |       Slash command       |
|:-------------------------------------:|:------------:|:-----------------------:|:-------------------------:|
| Play jankenpon (rock, scissor, paper) |      :x:     | `$jkp` / `$jankenpon` |   `/minigame jankenpon`   |


## Misc

|      Feature      |    Context menu    |     Message command    |     Slash command     |
|:-----------------:|:------------------:|:----------------------:|:---------------------:|
| Check user info   | :heavy_check_mark: | `$info` / `$userinfo`  |     `/check-info`     |
| SauceNAO          | :heavy_check_mark: |  `$sn` / `$saucenao`   |      `/saucenao`      |
| Math              |         :x:        |     `$m` / `$math`     |     `/math`           |
| Currency exchange |         :x:        |     `$ce` / `$curr`    | `/currency-exchange`  |

# Resources

- NHentai API by [paukuman/Nhentai-Modules](https://github.com/paukuman/Nhentai-Modules)
- MyAnimeList API by [Jikan](https://github.com/jikan-me/jikan), typings from [@shineiichijo/marika](https://github.com/LuckyYam/Marika)
- Blue Archive data from [@lonqie/SchaleDB](https://github.com/lonqie/SchaleDB)

# Dependencies

- [QS](https://github.com/ljharb/qs)
- [Table](https://github.com/gajus/table)
- [Axios](https://axios-http.com)
- [Mongoose](https://mongoosejs.com)
- [Node-cron](https://github.com/kelektiv/node-cron)
- [Node-cache](https://github.com/node-cache/node-cache)
- [Html-Entities](https://github.com/mdevils/html-entities)
- [Quickchart-JS](https://github.com/typpo/quickchart-js)

# Documentations

- [Discord.js](https://discordx.js.org/docs/discordx/getting-started)
- [Discordx examples](https://github.com/discordx-ts/discordx/tree/main/packages/discordx/examples)

## License

MIT License

Copyright (c) 2023 Nguyen Tran Anh Khoa

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