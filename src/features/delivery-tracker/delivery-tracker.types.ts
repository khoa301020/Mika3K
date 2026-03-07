export enum DeliveryStatus {
  PENDING = 'PENDING',
  INTERNATIONAL_PROCESSING = 'INTERNATIONAL_PROCESSING',
  CROSS_BORDER_TRANSIT = 'CROSS_BORDER_TRANSIT',
  CUSTOMS_CLEARANCE = 'CUSTOMS_CLEARANCE',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum DeliveryProvider {
  SPX = 'SPX',
  JNT = 'J&T',
  GHN = 'GHN',
  LEX = 'LEX',
}

export interface ITrackingRecord {
  code?: string;
  trackingUrl?: string;
  status: string;
  description: string;
  timestamp: number;
  location: string | null;
  rawData?: any;
}

export type BroadcastStatus = 'approved' | 'pending';

export interface IBroadcastTarget {
  userId: string;
  channelId?: string;
  guildId?: string;
  type: 'dm' | 'channel';
  status: BroadcastStatus;
  inviteMessageId?: string;
}

export interface IDeliveryTracker {
  trackingCode: string;
  provider: DeliveryProvider;
  remark: string;
  ownerId: string;
  broadcastTargets: IBroadcastTarget[];
  records: ITrackingRecord[];
  lastKnownStatus: DeliveryStatus;
  lastPolledAt: Date;
  lastUpdatedAt: Date;
  isEnded: boolean;
  isFailed: boolean;
  createdAt: Date;
  providerMeta?: Record<string, any>;
  aliasCodes?: string[];
}
