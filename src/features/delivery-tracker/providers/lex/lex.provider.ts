import { Injectable, Logger } from '@nestjs/common';
import { AppCacheService } from '../../../../shared/cache';
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
  cb_ex_customs_clearance_success: DeliveryStatus.CUSTOMS_CLEARANCE,
  cb_uplifted: DeliveryStatus.CROSS_BORDER_TRANSIT,
  cb_linehaul_arrival_success: DeliveryStatus.CUSTOMS_CLEARANCE,
  cb_submit_to_customs: DeliveryStatus.CUSTOMS_CLEARANCE,
  cb_customs_clearance_success: DeliveryStatus.CUSTOMS_CLEARANCE,
  cb_released_from_custom_broker: DeliveryStatus.IN_TRANSIT,
  cb_handover_to_last_mile: DeliveryStatus.IN_TRANSIT,
  // Domestic (VN)
  domestic_sc_sign_in_success: DeliveryStatus.IN_TRANSIT,
  'domestic_pickup/sign_in_success': DeliveryStatus.IN_TRANSIT,
  'domestic_pickup/sign_in_failure': DeliveryStatus.IN_TRANSIT,
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
  package_cancelled: DeliveryStatus.CANCELLED,
};

const LEX_BASE_HEADERS: Record<string, string> = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
  'content-type': 'application/json',
  'origin': 'https://logistics.lazada.vn',
  'referer': 'https://logistics.lazada.vn/',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
};

const LEX_COOKIE_CACHE_KEY = 'LEX_COOKIE';

@Injectable()
export class LexProvider implements ITrackerProvider {
  private readonly logger = new Logger(LexProvider.name);

  constructor(
    private readonly httpService: AppHttpService,
    private readonly cacheService: AppCacheService,
  ) {}

  /** Build headers with the WAF-bypass cookie from cache (if available). */
  private async getHeaders(): Promise<Record<string, string>> {
    const cookie = await this.cacheService.get<string>(LEX_COOKIE_CACHE_KEY);
    if (!cookie) {
      this.logger.warn('[LEX] No WAF cookie found in cache — requests may be blocked');
      return { ...LEX_BASE_HEADERS };
    }
    return { ...LEX_BASE_HEADERS, cookie };
  }

  readonly providerName = DeliveryProvider.LEX;
  readonly pollingCron = '0 0 * * * *'; // Every hour at minute 0
  readonly pollingDelayMs = 2000;
  readonly codePrefixes = ['LEX', 'LXB'];
  /** Lazada sub-carrier prefixes (domestic shipments fulfilled by partner carriers) */
  readonly subCarrierPrefixes = ['JNTXB', 'JNTMP', 'JNTRT', 'BESTMP'];

  detectProvider(code: string): boolean {
    const upper = code.toUpperCase();
    // Standard LEX/LXB prefix
    if (this.codePrefixes.some((p) => upper.startsWith(p))) return true;
    // Lazada sub-carrier domestic codes (e.g. JNTXB1008613222, BESTMP0052402477VNA)
    if (this.subCarrierPrefixes.some((p) => upper.startsWith(p))) return true;
    // Cross-border pre-import format: digits_alphanumeric (e.g. 521413287071885_SF3264471265749-3699)
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
    _getLatestStatus: (code: string) => string | undefined,
  ): Promise<{ codesToPoll: string[]; swaps: Record<string, string> }> {
    const swaps: Record<string, string> = {};
    // Start with all codes — we always want to poll everything.
    // The List API is only used here for swap detection (LXB → LEX).
    const codesToPoll = new Set<string>(codes);

    // Chunk into batches of 10 (LEX API limit)
    for (let i = 0; i < codes.length; i += 10) {
      const batch = codes.slice(i, i + 10);

      try {
        const headers = await this.getHeaders();
        const response = await this.httpService.post<ILexListResponse>(
          LEX_LIST_URL,
          { trackingNumbers: batch },
          { headers },
        );

        if (response?.data?.success && response.data.data) {
          for (const item of response.data.data) {
            // Only care about swap detection: originalTrackingNumber → trackingNumber
            if (
              item.originalTrackingNumber &&
              item.originalTrackingNumber !== item.trackingNumber &&
              batch.includes(item.originalTrackingNumber)
            ) {
              swaps[item.originalTrackingNumber] = item.trackingNumber;
              // Replace the old pre-import code with the new LEX code in the poll set.
              // The swap is processed before polling, so the new code will be in DB by then.
              codesToPoll.delete(item.originalTrackingNumber);
              codesToPoll.add(item.trackingNumber);
            }
          }
        } else {
          this.logger.error(`[LEX] List API query failed for batch: ${JSON.stringify(response?.data)}`);
        }
        // On API failure we still poll all (already in the set)
      } catch (err) {
        this.logger.warn(`LEX list API failed for batch: ${err}`);
      }

      if (i + 10 < codes.length) {
        await new Promise((r) => setTimeout(r, this.pollingDelayMs));
      }
    }

    return { codesToPoll: [...codesToPoll], swaps };
  }

  // ─── Detail Fetch ─────────────────────────────────────────────

  async fetchTracking(
    code: string,
    meta?: Record<string, any>,
  ): Promise<ITrackingRecord[]> {
    const body: Record<string, any> = { trackingNumber: code };
    if (meta?.phone) {
      body.recipientPhoneNumber = meta.phone;
    }

    const headers = await this.getHeaders();
    const response = await this.httpService.post<ILexDetailResponse>(
      LEX_DETAIL_URL,
      body,
      { headers },
    );

    const data = response?.data;
    if (!data?.success) {
      throw new Error(JSON.stringify(data));
    }
    if (!data.data?.timeline?.length) {
      return [];
    }

    // API returns timeline in newest-first order already
    return data.data.timeline.map((entry) =>
      this.mapRecord(entry, code),
    );
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

    // Collect proof-of-delivery photos — epod can be call log text on failures, so URL-check it
    const photoUrls: string[] = [];
    if (raw.photos && typeof raw.photos === 'string' && raw.photos.startsWith('http')) photoUrls.push(raw.photos);
    if (raw.epod && typeof raw.epod === 'string' && raw.epod.startsWith('http')) photoUrls.push(raw.epod);

    return {
      trackingUrl: this.getTrackingUrl(trackingCode),
      status: raw.status.toUpperCase(),
      description: label,
      timestamp: unixSeconds,
      location: raw.location || null,
      ...(raw.reasonCode ? { reason: raw.reasonCode } : {}),
      ...(photoUrls.length ? { photoUrls } : {}),
      rawData: raw,
    };
  }
}
