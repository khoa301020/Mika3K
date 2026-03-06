import {
    DeliveryProvider,
    DeliveryStatus,
    ITrackingRecord,
} from '../delivery-tracker.types';

export interface ITrackerProvider {
  readonly providerName: DeliveryProvider;

  /** Cron expression for this provider's polling interval */
  readonly pollingCron: string;

  /** Delay (ms) between API calls during a polling cycle */
  readonly pollingDelayMs: number;

  /** Code prefixes this provider handles (e.g. ['SPXVN']) */
  readonly codePrefixes: string[];

  /** Fetch tracking records from provider API */
  fetchTracking(
    code: string,
    meta?: Record<string, any>,
  ): Promise<ITrackingRecord[]>;

  /** Optional: pre-parse and isolate specifics from code/remark input before tracker creation */
  parseInput?(
    code: string,
    remark: string,
  ): { cleanCode: string; cleanRemark: string; meta?: Record<string, any> };

  /** Get the public tracking URL for a code */
  getTrackingUrl(code: string, meta?: Record<string, any>): string;

  /** Check if this provider handles the given code */
  detectProvider(code: string): boolean;

  /** Resolve overall status from latest records */
  resolveStatus(records: ITrackingRecord[]): DeliveryStatus;
}
