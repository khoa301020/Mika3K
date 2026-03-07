import { Injectable, Logger } from '@nestjs/common';
import { AppHttpService } from '../../../../shared/http';
import {
  DeliveryProvider,
  DeliveryStatus,
  ITrackingRecord,
} from '../../delivery-tracker.types';
import { ITrackerProvider } from '../tracker-provider.interface';
import {
  ILexDetailResponse,
  ILexListResponse,
  ILexTimelineEntry,
  LEX_STATUS_LABELS,
} from './lex.types';

const LEX_DETAIL_URL = 'https://logistics.lazada.vn/api/get_package_history';
const LEX_LIST_URL = 'https://logistics.lazada.vn/api/search_packages';

/** LEX raw status → universal DeliveryStatus */
const LEX_STATUS_MAP: Record<string, DeliveryStatus> = {
  // Cross-border (China → VN)
  cb_pre_accept: DeliveryStatus.INTERNATIONAL_PROCESSING,
  cb_pre_transport: DeliveryStatus.INTERNATIONAL_PROCESSING,
  cb_pre_delivering: DeliveryStatus.INTERNATIONAL_PROCESSING,
  cb_pre_agent_sign: DeliveryStatus.INTERNATIONAL_PROCESSING,
  cb_pre_sign: DeliveryStatus.INTERNATIONAL_PROCESSING,
  cb_sign_in_success: DeliveryStatus.INTERNATIONAL_PROCESSING,
  cb_ib_success_in_sort_center: DeliveryStatus.INTERNATIONAL_PROCESSING,
  cb_ob_success_in_sort_center: DeliveryStatus.INTERNATIONAL_PROCESSING,
  cb_handover: DeliveryStatus.CUSTOMS_CLEARANCE,
  cb_uplifted: DeliveryStatus.CROSS_BORDER_TRANSIT,
  cb_linehaul_arrival_success: DeliveryStatus.CUSTOMS_CLEARANCE,
  // Domestic (VN)
  domestic_ib_success_in_sort_center: DeliveryStatus.IN_TRANSIT,
  domestic_linehaul_packed: DeliveryStatus.IN_TRANSIT,
  domestic_pkg_outbound_attendance: DeliveryStatus.IN_TRANSIT,
  domestic_ob_success_in_sort_center: DeliveryStatus.IN_TRANSIT,
  domestic_package_stationed_in: DeliveryStatus.IN_TRANSIT,
  domestic_package_stationed_out: DeliveryStatus.OUT_FOR_DELIVERY,
  domestic_out_for_delivery: DeliveryStatus.OUT_FOR_DELIVERY,
  domestic_about_to_deliver: DeliveryStatus.OUT_FOR_DELIVERY,
  domestic_delivered: DeliveryStatus.DELIVERED,
  domestic_return: DeliveryStatus.RETURNED,
  domestic_returned: DeliveryStatus.RETURNED,
};

const LEX_HEADERS = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
  'content-type': 'application/json',
  'origin': 'https://logistics.lazada.vn',
  'referer': 'https://logistics.lazada.vn/',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
};

@Injectable()
export class LexProvider implements ITrackerProvider {
  private readonly logger = new Logger(LexProvider.name);

  constructor(private readonly httpService: AppHttpService) {}

  readonly providerName = DeliveryProvider.LEX;
  readonly pollingCron = '0 */30 * * * *'; // Every 30 minutes
  readonly pollingDelayMs = 2000;
  readonly codePrefixes = ['LEX', 'LXB'];

  detectProvider(code: string): boolean {
    const upper = code.toUpperCase();
    // Standard LEX/LXB prefix
    if (this.codePrefixes.some((p) => upper.startsWith(p))) return true;
    // Pre-import format: digits_alphanumeric (e.g. 521413287071885_SF3264471265749 or 526015723983484_JT3155412299645-3699)
    if (/^\d+_[A-Z0-9]+(?:[-:]\d{4})?$/i.test(code)) return true;
    return false;
  }

  parseInput(
    code: string,
    remark: string,
  ): { cleanCode: string; cleanRemark: string; meta?: Record<string, any> } {
    let cleanCode = code.toUpperCase();
    let cleanRemark = remark;
    const providerMeta: Record<string, any> = {};

    // Optional phone suffix (e.g. LEXST123-5265) 
    const codeMatch = cleanCode.match(/^([A-Z0-9_]+)[-:](\d{4})$/);
    if (codeMatch) {
      cleanCode = codeMatch[1];
      providerMeta.phone = codeMatch[2];
    } else {
      const remarkMatch = cleanRemark.match(/^(\d{4})(?:\s+(.*))?$/);
      if (remarkMatch) {
        providerMeta.phone = remarkMatch[1];
        cleanRemark = remarkMatch[2] || '';
      }
    }

    return { cleanCode, cleanRemark, meta: providerMeta };
  }

  getTrackingUrl(code: string, _meta?: Record<string, any>): string {
    return `https://logistics.lazada.vn/tracking?references=${code}`;
  }

  // ─── Bulk List API Optimization ───────────────────────────────

  async filterActiveCodes(
    codes: string[],
    getLatestStatus: (code: string) => string | undefined,
  ): Promise<{ codesToPoll: string[]; swaps: Record<string, string> }> {
    const changed: string[] = [];
    const swaps: Record<string, string> = {};

    // Chunk into batches of 10 (LEX API limit)
    for (let i = 0; i < codes.length; i += 10) {
      const batch = codes.slice(i, i + 10);

      try {
        const response = await this.httpService.post<ILexListResponse>(
          LEX_LIST_URL,
          { trackingNumbers: batch },
          { headers: LEX_HEADERS },
        );

        if (response?.data?.success && response.data.data) {
          for (const item of response.data.data) {
            // Detect code swaps
            let currentCode = item.originalTrackingNumber || item.trackingNumber;
            let targetCode = item.trackingNumber;

            // Specifically for LEX, sometimes original is missing or same
            if (
              item.originalTrackingNumber &&
              item.originalTrackingNumber !== item.trackingNumber &&
              batch.includes(item.originalTrackingNumber)
            ) {
              swaps[item.originalTrackingNumber] = targetCode;
            } else if (batch.includes(targetCode)) {
               currentCode = targetCode;
            } else {
               // Failsafe in case it matched arbitrarily
               currentCode = item.originalTrackingNumber && batch.includes(item.originalTrackingNumber) ? item.originalTrackingNumber : targetCode;
            }

            const dbStatus = getLatestStatus(currentCode);
            // If we detected a swap, or the status differs, mark it for polling using the NEW code
            if (swaps[currentCode] || dbStatus !== item.packageStatus) {
              changed.push(targetCode);
            }
          }
          
          // Codes omitted by the List API should still be polled via the detailed API 
          // (e.g. brand new pre-import tracking codes that only exist in other systems)
          const returnedCodes = new Set(
            response.data.data.flatMap(item => [item.trackingNumber, item.originalTrackingNumber]).filter(Boolean)
          );
          
          for (const code of batch) {
            if (!returnedCodes.has(code)) {
              changed.push(code);
            }
          }
        } else {
          // If list API fails, fall back to polling all
          changed.push(...batch);
        }
      } catch (err) {
        this.logger.warn(`LEX list API failed for batch, falling back: ${err}`);
        changed.push(...batch);
      }

      if (i + 10 < codes.length) {
        await new Promise((r) => setTimeout(r, this.pollingDelayMs));
      }
    }

    return { codesToPoll: changed, swaps };
  }

  // ─── Detail Fetch ─────────────────────────────────────────────

  async fetchTracking(
    code: string,
    meta?: Record<string, any>,
  ): Promise<ITrackingRecord[]> {
    try {
      const body: Record<string, any> = { trackingNumber: code };
      if (meta?.phone) {
        body.recipientPhoneNumber = meta.phone;
      }

      const response = await this.httpService.post<ILexDetailResponse>(
        LEX_DETAIL_URL,
        body,
        { headers: LEX_HEADERS },
      );

      const data = response?.data;
      if (!data?.success || !data.data?.timeline?.length) {
        return [];
      }

      // API returns timeline in newest-first order already
      return data.data.timeline.map((entry) =>
        this.mapRecord(entry, code),
      );
    } catch (error: any) {
      this.logger.error(`[LEX] Tracking error for ${code}: ${error.message}`);
      return [];
    }
  }

  resolveStatus(records: ITrackingRecord[]): DeliveryStatus {
    if (!records.length) return DeliveryStatus.PENDING;

    // Use the latest record (first in array)
    const latest = records[0];
    const rawStatus = latest.rawData?.status;

    if (rawStatus && LEX_STATUS_MAP[rawStatus]) {
      return LEX_STATUS_MAP[rawStatus];
    }

    return DeliveryStatus.IN_TRANSIT;
  }

  private mapRecord(raw: ILexTimelineEntry, trackingCode: string): ITrackingRecord {
    // processTime is in milliseconds
    const unixSeconds = Math.floor(raw.processTime / 1000);
    const label = LEX_STATUS_LABELS[raw.status] || raw.status;

    return {
      code: raw.status,
      trackingUrl: this.getTrackingUrl(trackingCode),
      status: raw.status.toUpperCase(),
      description: `${label}${raw.location ? ` [${raw.location}]`: ''}`,
      timestamp: unixSeconds,
      location: raw.location || null,
      rawData: raw,
    };
  }
}
