import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { AppHttpService } from '../../../../shared/http';
import {
    DeliveryProvider,
    DeliveryStatus,
    ITrackingRecord,
} from '../../delivery-tracker.types';
import { ITrackerProvider } from '../tracker-provider.interface';

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
    const hasPrefix = this.codePrefixes.some((prefix) => upper.startsWith(prefix));
    const isTiktokFormat = /^\d{12}(?:[-:]\d{4})?$/.test(code);
    return hasPrefix || isTiktokFormat;
  }

  parseInput(
    code: string,
    remark: string,
  ): { cleanCode: string; cleanRemark: string; meta?: Record<string, any> } {
    let cleanCode = code.toUpperCase();
    let cleanRemark = remark;
    const providerMeta: Record<string, any> = {};

    // 1. Try to extract phone suffix from code (e.g. JNT123-5265)
    const codeMatch = cleanCode.match(/^([A-Z0-9]+)[-:](\d{4})$/);
    if (codeMatch) {
      cleanCode = codeMatch[1];
      providerMeta.phone = codeMatch[2];
    }
    // 2. Try to extract from the beginning of remark if separated by space (e.g. Code JNT123, Remark "5265 Note")
    else {
      const remarkMatch = cleanRemark.match(/^(\d{4})(?:\s+(.*))?$/);
      if (remarkMatch) {
        providerMeta.phone = remarkMatch[1];
        cleanRemark = remarkMatch[2] || '';
      }
    }

    if (!providerMeta.phone) {
      throw new Error(
        `[J&T] Yêu cầu cung cấp 4 số cuối SĐT nhận/gửi. VD: \`$track ${cleanCode}-1234\``,
      );
    }

    return { cleanCode, cleanRemark, meta: providerMeta };
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
  }

  resolveStatus(records: ITrackingRecord[]): DeliveryStatus {
    if (!records.length) return DeliveryStatus.PENDING;
    const descs = records.map((r) => r.description.toLowerCase());
    if (descs.some((d) => d.includes('đã ký nhận'))) return DeliveryStatus.DELIVERED;
    if (descs.some((d) => d.includes('đang giao hàng'))) return DeliveryStatus.OUT_FOR_DELIVERY;
    return DeliveryStatus.IN_TRANSIT;
  }
}
