import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorLog, ErrorLogDocument } from '../schemas/error-log.schema';

export interface ErrorPayload {
  message: string;
  context?: string;
  stack?: string;
}

@Injectable()
export class DatabaseLoggerListener {
  constructor(
    @InjectModel(ErrorLog.name)
    private readonly errorLogModel: Model<ErrorLogDocument>,
  ) {}

  @OnEvent('log.error', { async: true })
  async handleGlobalError(payload: ErrorPayload) {
    try {
      await this.errorLogModel.create({
        message: payload.message,
        context: payload.context,
        stack: payload.stack,
      });
    } catch (e) {
      console.error('Failed to write error to MongoDB', e);
    }
  }
}
