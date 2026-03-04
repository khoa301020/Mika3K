import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ApiModule } from './api/api.module';
import { BotModule } from './core/bot';
import { AppConfigModule } from './core/config';
import { DatabaseModule } from './core/database';
import { LoggerModule } from './core/logger';
import { BlueArchiveModule } from './features/blue-archive';
import { DeliveryTrackerModule } from './features/delivery-tracker/delivery-tracker.module';
import { HoyolabModule } from './features/hoyolab/hoyolab.module';
import { MalModule } from './features/mal';
import { MinigamesModule } from './features/minigames/minigames.module';
import { MiscModule } from './features/misc';
import { NHentaiModule } from './features/nhentai/nhentai.module';
import { PixivModule } from './features/pixiv/pixiv.module';
import { QuoteModule } from './features/quote';
import { SnsEmbedModule } from './features/sns-embed/sns-embed.module';
import { SyosetuModule } from './features/syosetu/syosetu.module';
import { AppCacheModule } from './shared/cache';
import { EmbedModule } from './shared/embed';
import { AppHttpModule } from './shared/http';
import { PaginationModule } from './shared/pagination';
import { AppSchedulerModule } from './shared/scheduler';

@Module({
  imports: [
    // Core
    AppConfigModule,
    EventEmitterModule.forRoot(),
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
    DeliveryTrackerModule,

    // API
    ApiModule,
  ],
})
export class AppModule {}
