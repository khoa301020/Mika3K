import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DeliveryProvider,
  DeliveryStatus,
  IBroadcastTarget,
  ITrackingRecord,
} from './delivery-tracker.types';
import {
  DeliveryTracker,
  DeliveryTrackerDocument,
} from './schemas/delivery-tracker.schema';

export interface IParsedTrackInput {
  code: string;
  remark: string;
}

@Injectable()
export class DeliveryTrackerService {
  private readonly logger = new Logger(DeliveryTrackerService.name);

  constructor(
    @InjectModel(DeliveryTracker.name)
    private readonly trackerModel: Model<DeliveryTrackerDocument>,
  ) {}

  // ─── Parsing ──────────────────────────────────────────────────

  /** Parse semicolon-separated input: "CODE1 Remark1; CODE2 Remark2" */
  parseTrackInput(input: string): IParsedTrackInput[] {
    return input
      .split(';')
      .map((segment) => segment.trim())
      .filter(Boolean)
      .map((segment) => {
        const parts = segment.split(/\s+/);
        const code = parts[0];
        const remark = parts.slice(1).join(' ') || code;
        return { code, remark };
      });
  }

  // ─── Create / Remove ─────────────────────────────────────────

  /** Atomically create a tracker. Throws if active doc already exists for {code, owner}. */
  async createTracker(
    trackingCode: string,
    provider: DeliveryProvider,
    remark: string,
    ownerId: string,
    broadcastTargets: IBroadcastTarget[],
    providerMeta?: Record<string, any>,
  ): Promise<DeliveryTrackerDocument> {
    const existing = await this.trackerModel
      .findOne({ trackingCode, ownerId, isEnded: false, isFailed: false })
      .lean();

    if (existing) {
      throw new Error(
        `Tracker for \`${trackingCode}\` already exists. Use \`track-edit\` to modify it.`,
      );
    }

    return await this.trackerModel.create({
      trackingCode,
      provider,
      remark,
      ownerId,
      broadcastTargets,
      records: [],
      lastKnownStatus: DeliveryStatus.PENDING,
      lastUpdatedAt: new Date(),
      isEnded: false,
      isFailed: false,
      providerMeta: providerMeta || {},
    });
  }

  /** Delete a tracker document (works regardless of ended/failed state) */
  async removeTracker(
    trackingCode: string,
    ownerId: string,
  ): Promise<DeliveryTrackerDocument | null> {
    return await this.trackerModel.findOneAndDelete(
      { trackingCode, ownerId },
    );
  }

  // ─── Query ────────────────────────────────────────────────────

  /** Get distinct active tracking codes, optionally filtered by provider */
  async getDistinctActiveCodes(
    provider?: DeliveryProvider,
  ): Promise<string[]> {
    const filter: any = { isEnded: false, isFailed: false };
    if (provider) filter.provider = provider;
    return await this.trackerModel.distinct('trackingCode', filter);
  }

  /** Get all active tracker docs for a specific tracking code */
  async getActiveTrackersByCode(
    trackingCode: string,
  ): Promise<DeliveryTrackerDocument[]> {
    return await this.trackerModel
      .find({ trackingCode, isEnded: false, isFailed: false })
      .lean();
  }

  /** Get all active trackers, optionally filtered by provider */
  async getActiveTrackers(
    provider?: DeliveryProvider,
  ): Promise<DeliveryTrackerDocument[]> {
    const filter: any = { isEnded: false, isFailed: false };
    if (provider) filter.provider = provider;
    return await this.trackerModel.find(filter).lean();
  }

  /** Get trackers owned by a user */
  async getUserTrackers(
    ownerId: string,
    includeEnded = false,
  ): Promise<DeliveryTrackerDocument[]> {
    const filter: any = { ownerId };
    if (!includeEnded) {
      filter.isEnded = false;
      filter.isFailed = false;
    }
    return await this.trackerModel.find(filter).lean();
  }

  /** Get all trackers visible to a user (owned + approved broadcast) */
  async getVisibleTrackers(
    userId: string,
  ): Promise<DeliveryTrackerDocument[]> {
    return await this.trackerModel
      .find({
        isEnded: false,
        isFailed: false,
        $or: [
          { ownerId: userId },
          {
            broadcastTargets: {
              $elemMatch: { userId, status: 'approved' },
            },
          },
        ],
      })
      .lean();
  }

  /** Find a tracker visible to a user (owned or approved broadcast) */
  async getVisibleTrackerByCode(
    trackingCode: string,
    userId: string,
  ): Promise<DeliveryTrackerDocument | null> {
    return await this.trackerModel
      .findOne({
        trackingCode,
        $or: [
          { ownerId: userId },
          {
            broadcastTargets: {
              $elemMatch: { userId, status: 'approved' },
            },
          },
        ],
      })
      .lean();
  }

  /** Find a single tracker by code + owner */
  async getTrackerByCodeAndOwner(
    trackingCode: string,
    ownerId: string,
  ): Promise<DeliveryTrackerDocument | null> {
    return await this.trackerModel
      .findOne({ trackingCode, ownerId })
      .lean();
  }

  /** Find a single tracker by code (first match) */
  async getTrackerByCode(
    trackingCode: string,
  ): Promise<DeliveryTrackerDocument | null> {
    return await this.trackerModel.findOne({ trackingCode }).lean();
  }

  // ─── Records & Status ────────────────────────────────────────

  /** Append new records (sorted newest-first) and update status for a specific doc */
  async appendRecords(
    trackingCode: string,
    ownerId: string,
    newRecords: ITrackingRecord[],
    newStatus: DeliveryStatus,
  ): Promise<DeliveryTrackerDocument | null> {
    return await this.trackerModel.findOneAndUpdate(
      { trackingCode, ownerId, isEnded: false, isFailed: false },
      {
        $push: {
          records: {
            $each: newRecords,
            $sort: { timestamp: -1 },
          },
        },
        $set: {
          lastKnownStatus: newStatus,
          lastPolledAt: new Date(),
          lastUpdatedAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    );
  }

  /** Update lastPolledAt without new records */
  async touchPolled(trackingCode: string, ownerId: string): Promise<void> {
    await this.trackerModel.updateOne(
      { trackingCode, ownerId, isEnded: false, isFailed: false },
      { $set: { lastPolledAt: new Date() } },
    );
  }

  /** Mark a specific tracker as ended */
  async markEnded(trackingCode: string, ownerId: string): Promise<void> {
    await this.trackerModel.updateOne(
      { trackingCode, ownerId, isEnded: false },
      { $set: { isEnded: true } },
    );
  }

  /** Mark ALL active docs for a code as ended (terminal fan-out) */
  async markAllEndedByCode(trackingCode: string): Promise<void> {
    await this.trackerModel.updateMany(
      { trackingCode, isEnded: false },
      { $set: { isEnded: true } },
    );
  }

  /** Mark a specific tracker as failed */
  async markFailed(trackingCode: string, ownerId: string): Promise<void> {
    await this.trackerModel.updateOne(
      { trackingCode, ownerId },
      { $set: { isFailed: true, isEnded: true } },
    );
  }

  // ─── Broadcast Targets ───────────────────────────────────────

  /** Add a broadcast target. Returns error message if duplicate. */
  async addBroadcastTarget(
    trackingCode: string,
    ownerId: string,
    target: IBroadcastTarget,
  ): Promise<{ doc: DeliveryTrackerDocument | null; error?: string }> {
    const tracker = await this.trackerModel
      .findOne({ trackingCode, ownerId, isEnded: false })
      .lean();

    if (!tracker) {
      return { doc: null, error: `No active tracker found for \`${trackingCode}\`.` };
    }

    const existing = tracker.broadcastTargets.find(
      (t) =>
        t.userId === target.userId &&
        t.type === target.type &&
        (t.type === 'dm' || t.channelId === target.channelId),
    );

    if (existing) {
      return { doc: tracker as DeliveryTrackerDocument, error: 'User is already in the broadcast list.' };
    }

    const doc = await this.trackerModel.findOneAndUpdate(
      { trackingCode, ownerId, isEnded: false },
      { $push: { broadcastTargets: target } },
      { returnDocument: 'after' },
    );
    return { doc };
  }

  /** Remove a broadcast target by userId */
  async removeBroadcastTarget(
    trackingCode: string,
    ownerId: string,
    targetUserId: string,
  ): Promise<DeliveryTrackerDocument | null> {
    return await this.trackerModel.findOneAndUpdate(
      { trackingCode, ownerId, isEnded: false },
      { $pull: { broadcastTargets: { userId: targetUserId } } },
      { returnDocument: 'after' },
    );
  }

  /** Store the invite message ID for a pending broadcast target */
  async updateInviteMessageId(
    trackingCode: string,
    ownerId: string,
    targetUserId: string,
    messageId: string,
    channelId: string,
  ): Promise<void> {
    await this.trackerModel.updateOne(
      {
        trackingCode,
        ownerId,
        'broadcastTargets.userId': targetUserId,
        'broadcastTargets.status': 'pending',
      },
      {
        $set: {
          'broadcastTargets.$.inviteMessageId': messageId,
          'broadcastTargets.$.channelId': channelId,
        },
      },
    );
  }

  /** Approve a pending broadcast target */
  async approveBroadcastTarget(
    trackingCode: string,
    ownerId: string,
    targetUserId: string,
  ): Promise<DeliveryTrackerDocument | null> {
    return await this.trackerModel.findOneAndUpdate(
      {
        trackingCode,
        ownerId,
        'broadcastTargets.userId': targetUserId,
        'broadcastTargets.status': 'pending',
      },
      { $set: { 'broadcastTargets.$.status': 'approved' } },
      { returnDocument: 'after' },
    );
  }

  /** Update remark for a tracker */
  async updateRemark(
    trackingCode: string,
    ownerId: string,
    remark: string,
  ): Promise<DeliveryTrackerDocument | null> {
    return await this.trackerModel.findOneAndUpdate(
      { trackingCode, ownerId, isEnded: false },
      { $set: { remark } },
      { returnDocument: 'after' },
    );
  }

  // ─── Stale Trackers ──────────────────────────────────────────

  /** Get stale trackers (no updates for N days) */
  async getStaleTrackers(
    staleDays: number,
  ): Promise<DeliveryTrackerDocument[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - staleDays);
    return await this.trackerModel
      .find({
        isEnded: false,
        isFailed: false,
        lastUpdatedAt: { $lt: cutoff },
      })
      .lean();
  }
}
