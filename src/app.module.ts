import { Module } from '@nestjs/common';
import { AppConfigModule } from './core/config';
import { DatabaseModule } from './core/database';
import { BotModule } from './core/bot';
import { LoggerModule } from './core/logger';
import { AppHttpModule } from './shared/http';
import { AppCacheModule } from './shared/cache';
import { PaginationModule } from './shared/pagination';
import { EmbedModule } from './shared/embed';
import { AppSchedulerModule } from './shared/scheduler';
import { QuoteModule } from './features/quote';
import { MiscModule } from './features/misc';
import { MalModule } from './features/mal';
import { BlueArchiveModule } from './features/blue-archive';
import { HoyolabModule } from './features/hoyolab/hoyolab.module';
import { MinigamesModule } from './features/minigames/minigames.module';
import { NHentaiModule } from './features/nhentai/nhentai.module';
import { SyosetuModule } from './features/syosetu/syosetu.module';
import { SnsEmbedModule } from './features/sns-embed/sns-embed.module';
import { PixivModule } from './features/pixiv/pixiv.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    // Core
    AppConfigModule,
    DatabaseModule,
    BotModule,
    LoggerModule,

    // Shared
    AppHttpModule,
    AppCacheModule,
    PaginationModule,
    EmbedModule,
    AppSchedulerModule,

    // Features
    QuoteModule,
    MiscModule,
    MalModule,
    BlueArchiveModule,
    HoyolabModule,
    MinigamesModule,
    NHentaiModule,
    SyosetuModule,
    SnsEmbedModule,
    PixivModule,

    // API
    ApiModule,
  ],
})
export class AppModule {}
