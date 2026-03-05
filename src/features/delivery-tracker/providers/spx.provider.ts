import { Injectable, Logger } from '@nestjs/common';
import { AppHttpService } from '../../../shared/http';
import {
  DeliveryProvider,
  DeliveryStatus,
  ITrackingRecord,
} from '../delivery-tracker.types';
import { ISpxRecord, ISpxResponse } from './spx.types';
import { ITrackerProvider } from './tracker-provider.interface';

/** SPX milestone codes → universal DeliveryStatus */
const SPX_MILESTONE_STATUS: Record<number, DeliveryStatus> = {
  1: DeliveryStatus.PENDING,
  5: DeliveryStatus.IN_TRANSIT,
  6: DeliveryStatus.OUT_FOR_DELIVERY,
  8: DeliveryStatus.DELIVERED,
  10: DeliveryStatus.RETURNED,
};

const SPX_API_URL =
  'https://spx.vn/shipment/order/open/order/get_order_info';

const SPX_TRACKING_URL = 'https://spx.vn/track'

@Injectable()
export class SpxProvider implements ITrackerProvider {
  private readonly logger = new Logger(SpxProvider.name);

  readonly providerName = DeliveryProvider.SPX;
  readonly pollingCron = '0 */10 * * * *'; // Every 10 minutes
  readonly pollingDelayMs = 2000;
  readonly codePrefixes = ['SPXVN', 'VN'];

  getTrackingUrl(code: string, _meta?: Record<string, any>): string {
    return `${SPX_TRACKING_URL}?tracking_number=${code}`;
  }

  constructor(private readonly httpService: AppHttpService) {}

  detectProvider(code: string): boolean {
    const upper = code.toUpperCase();
    return this.codePrefixes.some((prefix) => upper.startsWith(prefix));
  }

  async fetchTracking(code: string): Promise<ITrackingRecord[]> {
    try {
      const { data: response } = await this.httpService.get<ISpxResponse>(
        `${SPX_API_URL}?spx_tn=${code}&language_code=vi`,
      );

      if (
        response.retcode !== 0 ||
        !response.data?.sls_tracking_info?.records
      ) {
        this.logger.warn(
          `SPX API returned non-success for ${code}: ${response.message}`,
        );
        return [];
      }

      return response.data.sls_tracking_info.records.map((record) =>
        this.mapRecord(code, record),
      );
    } catch (error) {
      this.logger.error(`Failed to fetch SPX tracking for ${code}:`, error);
      return [];
    }
  }

  resolveStatus(records: ITrackingRecord[]): DeliveryStatus {
    if (!records.length) return DeliveryStatus.PENDING;

    const latestRaw = records[0]?.rawData as ISpxRecord | undefined;
    if (!latestRaw) return DeliveryStatus.IN_TRANSIT;

    return (
      SPX_MILESTONE_STATUS[latestRaw.milestone_code] ??
      DeliveryStatus.IN_TRANSIT
    );
  }

  private mapRecord(code: string, raw: ISpxRecord): ITrackingRecord {
    return {
      code: raw.tracking_code,
      trackingUrl: this.getTrackingUrl(code),
      status: raw.tracking_name,
      description: raw.seller_description,
      timestamp: raw.actual_time,
      location: raw.current_location?.location_name?.trim() || null,
      rawData: raw,
    };
  }
}
