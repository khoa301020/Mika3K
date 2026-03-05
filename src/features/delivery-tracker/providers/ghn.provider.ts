import { Injectable, Logger } from '@nestjs/common';
import { AppHttpService } from '../../../shared/http';
import {
  DeliveryProvider,
  DeliveryStatus,
  ITrackingRecord,
} from '../delivery-tracker.types';
import { IGhnTrackingLog, IGhnTrackingResponse } from './ghn.types';
import { ITrackerProvider } from './tracker-provider.interface';

const GHN_API_URL = 'https://fe-online-gateway.ghn.vn/order-tracking/public-api/client/tracking-logs';

@Injectable()
export class GhnProvider implements ITrackerProvider {
  private readonly logger = new Logger(GhnProvider.name);

  readonly providerName = DeliveryProvider.GHN;
  readonly pollingCron = '0 */30 * * * *'; // Every 30 minutes
  readonly pollingDelayMs = 2000;
  readonly codePrefixes = []; // GHN falls back on Regex or explicit detection

  constructor(private readonly httpService: AppHttpService) {}

  detectProvider(code: string): boolean {
    const upper = code.toUpperCase();
    // GHN codes typically start with 'G' and are exactly 8 chars long (e.g. GYP8X3D4)
    // Sometimes they can have different patterns, but standard rule applies.
    if (upper.length === 8 && /^[A-Z0-9]{8}$/.test(upper)) {
      return true;
    }
    return false;
  }

  getTrackingUrl(code: string, _meta?: Record<string, any>): string {
    return `https://donhang.ghn.vn/?order_code=${code}`;
  }

  getExecutor(raw: Record<string, any>): string {
    return `${raw.executor.name} - ${raw.executor.phone}`;
  }

  async fetchTracking(
    code: string,
    _meta?: Record<string, any>,
  ): Promise<ITrackingRecord[]> {
    try {
      const response = await this.httpService.post<IGhnTrackingResponse>(
        GHN_API_URL,
        {
          order_code: code,
        },
        {
          headers: {
            'accept': 'application/json',
            'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
            'content-type': 'application/json',
            'origin': 'https://donhang.ghn.vn',
            'referer': 'https://donhang.ghn.vn/',
            'token': '[object Object]',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
          },
        }
      );

      const data = response?.data;

      // Handle invalid or not-found tracking code
      if (!data || !data.data || !data.data.tracking_logs) {
        this.logger.warn(`GHN response indicates invalid order code: ${code}`);
        return [];
      }

      // The tracking_logs are usually sorted older to newer by default in GHN.
      // We process them and sort them descending (newest first).
      const records = data.data.tracking_logs
        .map((log) => this.mapRecord(log, code))
        .sort((a, b) => b.timestamp - a.timestamp);

      return records;
    } catch (error) {
      this.logger.error(`Error fetching GHN tracking for ${code}:`, error.message);
      return [];
    }
  }

  resolveStatus(records: ITrackingRecord[]): DeliveryStatus {
    if (!records.length) return DeliveryStatus.PENDING;

    // Use the latest record (first in the returned array due to our sorting)
    const latest = records[0];

    // GHN status mapping
    // delivered: Delivered
    // return: Returned
    // cancel: Failed
    // anything else is typically pending or in-transit
    const statusMap: Record<string, DeliveryStatus> = {
      delivered: DeliveryStatus.DELIVERED,
      returned: DeliveryStatus.RETURNED,
      cancel: DeliveryStatus.FAILED,
      ready_to_pick: DeliveryStatus.PENDING,
    };

    return statusMap[latest.status.toLowerCase()] || DeliveryStatus.IN_TRANSIT;
  }

  private mapRecord(raw: IGhnTrackingLog, orderCode: string): ITrackingRecord {
    // Parse the ISO date string "2026-01-11T08:41:56.211Z" into an epoch in seconds
    const unixSeconds = Math.floor(new Date(raw.action_at).getTime() / 1000);

    return {
      code: raw.action_code, // Not the order code, but the specific action code for UI debugging
      trackingUrl: this.getTrackingUrl(orderCode),
      status: raw.status_name,
      description: raw.location?.address || raw.status_name,
      timestamp: unixSeconds,
      location: this.getExecutor(raw),
    };
  }
}
