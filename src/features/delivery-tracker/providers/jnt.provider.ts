import { Injectable, Logger } from '@nestjs/common';
import {
  DeliveryProvider,
  DeliveryStatus,
  ITrackingRecord,
} from '../delivery-tracker.types';
import { ITrackerProvider } from './tracker-provider.interface';

@Injectable()
export class JntProvider implements ITrackerProvider {
  private readonly logger = new Logger(JntProvider.name);

  readonly providerName = DeliveryProvider.JNT;
  readonly pollingCron = '0 */15 * * * *'; // Every 15 minutes
  readonly pollingDelayMs = 2000;
  readonly codePrefixes = ['JNT'];

  detectProvider(code: string): boolean {
    const upper = code.toUpperCase();
    return this.codePrefixes.some((prefix) => upper.startsWith(prefix));
  }

  async fetchTracking(
    _code: string,
    _meta?: Record<string, any>,
  ): Promise<ITrackingRecord[]> {
    this.logger.warn(
      'JNT provider is not yet implemented. Tracking response format is pending.',
    );
    throw new Error(
      'JNT tracking is not yet implemented. This provider will be available in a future update.',
    );
  }

  resolveStatus(_records: ITrackingRecord[]): DeliveryStatus {
    return DeliveryStatus.PENDING;
  }
}
