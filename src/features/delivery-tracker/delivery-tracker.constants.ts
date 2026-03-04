import { Injectable } from '@nestjs/common';
import { DeliveryStatus } from './delivery-tracker.types';

/**
 * Provider-neutral constants for the delivery tracker feature.
 * Provider-specific values (API URLs, milestone codes, prefixes, polling intervals)
 * live in each provider's own file.
 */
@Injectable()
export class DeliveryTrackerConstants {
  // ─── Lifecycle Thresholds ─────────────────────────────────────
  static readonly STALE_WARNING_DAYS = 10;
  static readonly AUTO_FAIL_DAYS = 60;
  static readonly INITIAL_RECORDS_LIMIT = 3;
  static readonly HISTORY_RECORDS_LIMIT = 10;
  static readonly MAX_HISTORY_RECORDS = 50;
  static readonly TRACK_LIST_PAGE_SIZE = 20;
  static readonly TIMEZONE = 'Asia/Ho_Chi_Minh';

  // ─── Command Identifiers ──────────────────────────────────────
  static readonly COMMAND_PREFIX_TRACK = 'track';
  static readonly BUTTON_ACCEPT = 'track_accept';
  static readonly BUTTON_REJECT = 'track_reject';

  // ─── Button Labels ────────────────────────────────────────────
  static readonly LABEL_ACCEPT = '✅ Accept';
  static readonly LABEL_REJECT = '❌ Reject';

  // ─── Embed Defaults ───────────────────────────────────────────
  static readonly DEFAULT_BOT_NAME = 'Mika3K';
  static readonly DEFAULT_COLOR = 0x3498db;
  static readonly COLOR_SUCCESS = 0x2ecc71;
  static readonly COLOR_WARNING = 0xf39c12;
  static readonly COLOR_MUTED = 0x95a5a6;

  // ─── Terminal Statuses (provider-neutral) ─────────────────────
  static readonly TERMINAL_STATUSES: DeliveryStatus[] = [
    DeliveryStatus.DELIVERED,
    DeliveryStatus.RETURNED,
    DeliveryStatus.FAILED,
  ];

  // ─── Status Visual Mapping (provider-neutral) ─────────────────
  static readonly STATUS_COLORS: Record<DeliveryStatus, number> = {
    [DeliveryStatus.PENDING]: 0x95a5a6,
    [DeliveryStatus.IN_TRANSIT]: 0x3498db,
    [DeliveryStatus.OUT_FOR_DELIVERY]: 0xf39c12,
    [DeliveryStatus.DELIVERED]: 0x2ecc71,
    [DeliveryStatus.RETURNED]: 0xe74c3c,
    [DeliveryStatus.FAILED]: 0x8b0000,
  };

  static readonly STATUS_EMOJI: Record<DeliveryStatus, string> = {
    [DeliveryStatus.PENDING]: '⏳',
    [DeliveryStatus.IN_TRANSIT]: '🚚',
    [DeliveryStatus.OUT_FOR_DELIVERY]: '📦',
    [DeliveryStatus.DELIVERED]: '✅',
    [DeliveryStatus.RETURNED]: '↩️',
    [DeliveryStatus.FAILED]: '❌',
  };
}
