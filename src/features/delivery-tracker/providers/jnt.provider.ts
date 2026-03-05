import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { AppHttpService } from '../../../shared/http';
import {
  DeliveryProvider,
  DeliveryStatus,
  ITrackingRecord,
} from '../delivery-tracker.types';
import { ITrackerProvider } from './tracker-provider.interface';

@Injectable()
export class JntProvider implements ITrackerProvider {
  private readonly logger = new Logger(JntProvider.name);

  constructor(private readonly httpService: AppHttpService) {}

  readonly providerName = DeliveryProvider.JNT;
  readonly pollingCron = '0 */30 * * * *'; // Every 30 minutes
  readonly pollingDelayMs = 2000;
  readonly codePrefixes = ['JNT'];

  detectProvider(code: string): boolean {
    const upper = code.toUpperCase();
    return this.codePrefixes.some((prefix) => upper.startsWith(prefix));
  }

  getTrackingUrl(code: string, meta?: Record<string, any>): string {
    return `https://jtexpress.vn/vi/tracking?type=track&billcode=${code}&cellphone=${meta?.phone || ''}`;
  }

  async fetchTracking(
    code: string,
    meta?: Record<string, any>,
  ): Promise<ITrackingRecord[]> {
    if (!meta?.phone || meta.phone.length !== 4) {
      throw new Error(
        `[J&T] Yêu cầu cung cấp 4 số cuối của SĐT nhận/gửi. (Cú pháp: $track ${code} <4_số_cuối_sđt>)`,
      );
    }

    try {
      const trackingUrl = `https://jtexpress.vn/vi/tracking?type=track&billcode=${code}&cellphone=${meta.phone}`;
      
      const response = await this.httpService.get(trackingUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
        },
      });

      const root = cheerio.load(response.data);
      const records: ITrackingRecord[] = [];

      root('.result-vandon-item').each((_, el) => {
        const item = root(el);
        const timeStr = item.find('ion-icon[name="time-outline"]').next('span').text().trim();
        const dateStr = item.find('ion-icon[name="calendar-clear-outline"]').next('span').text().trim();
        const description = item.children('div').last().text().trim().replace(/\s+/g, ' ');

        if (!timeStr || !dateStr || !description) return;

        // "2025-12-22" and "20:44:10" => "2025-12-22T20:44:10+07:00"
        const dateTimeStr = `${dateStr}T${timeStr}+07:00`;
        const timestamp = Math.floor(new Date(dateTimeStr).getTime() / 1000);

        records.push({
          trackingUrl,
          timestamp,
          status: 'Cập nhật',
          description,
          location: null,
        });
      });

      // Cheerio finds them top-down (newest first). Let's return as-is.
      return records;
    } catch (error: any) {
      this.logger.error(`[JNT] Tracking error for ${code}: ${error.message}`);
      throw new Error(`Lỗi khi lấy thông tin J&T: ${error.message}`);
    }
  }

  resolveStatus(records: ITrackingRecord[]): DeliveryStatus {
    if (!records.length) return DeliveryStatus.PENDING;

    // Checking if any record indicates delivery completion
    const isDelivered = records.some((r) =>
      r.description.toLowerCase().includes('đã ký nhận')
    );

    if (isDelivered) {
      return DeliveryStatus.DELIVERED;
    }

    return DeliveryStatus.IN_TRANSIT;
  }
}
