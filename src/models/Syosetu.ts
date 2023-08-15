import mongoose from 'mongoose';
import { IMongooseDocumentNovel } from '../types/syosetu';

const SyosetuSchema = new mongoose.Schema<IMongooseDocumentNovel>({
  ncode: {
    type: String,
    required: true,
    unique: true,
  },
  metadata: {
    title: String,
    writer: String,
    story: String,
    general_lastup: Date,
    novel_type: Number,
    end: Number,
    general_all_no: Number,
    length: Number,
    time: Number,
    novelupdated_at: Date,
  },
  followings: {
    _id: false,
    users: [String],
    channels: [String],
  },
  lastSystemUpdate: {
    type: Date,
    default: Date.now,
  },
});

SyosetuSchema.set('toJSON', { virtuals: true });

const Syosetu = mongoose.model('Syosetu', SyosetuSchema, 'Syosetu');

export default Syosetu;
