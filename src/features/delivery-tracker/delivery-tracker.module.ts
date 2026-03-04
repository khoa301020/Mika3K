import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppCacheModule } from '../../shared/cache';
import { EmbedModule } from '../../shared/embed';
import { AppHttpModule } from '../../shared/http';
import { PaginationModule } from '../../shared/pagination';
import { DeliveryTrackerCommandProviders } from './commands';
import { DeliveryTrackerConstants } from './delivery-tracker.constants';
import { DeliveryTrackerCron } from './delivery-tracker.cron';
import { DeliveryTrackerEmbeds } from './delivery-tracker.embeds';
import { DeliveryTrackerHelper } from './delivery-tracker.helper';
import { DeliveryTrackerService } from './delivery-tracker.service';
import { JntProvider } from './providers/jnt.provider';
import { SpxProvider } from './providers/spx.provider';
import {
    DeliveryTracker,
    DeliveryTrackerSchema,
} from './schemas/delivery-tracker.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryTracker.name, schema: DeliveryTrackerSchema },
    ]),
    AppHttpModule,
    AppCacheModule,
    EmbedModule,
    PaginationModule,
  ],
  providers: [
    DeliveryTrackerService,
    DeliveryTrackerHelper,
    DeliveryTrackerEmbeds,
    ...DeliveryTrackerCommandProviders,
    DeliveryTrackerCron,
    DeliveryTrackerConstants,
    SpxProvider,
    JntProvider,
  ],
  exports: [DeliveryTrackerService],
})
export class DeliveryTrackerModule {}
