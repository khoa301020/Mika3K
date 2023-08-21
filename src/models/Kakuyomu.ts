import mongoose from 'mongoose';
import { IKakuyomuDocument } from '../types/kakuyomu';

const KakuyomuSchema = new mongoose.Schema<IKakuyomuDocument>({
  novelId: {
    type: String,
    required: true,
    unique: true,
  },
  novelData: {
    title: String,
    isOneshot: Boolean,
    authorName: String,
    authorNameTag: String,
    status: String,
    chapters: [
      {
        _id: false,
        title: String,
        episodes: [
          {
            _id: false,
            episodeId: String,
            title: String,
            lastUpdate: Date,
          },
        ],
      },
    ],
    chaptersCount: Number,
    type: {
      type: String,
    },
    genre: {
      _id: false,
      name: String,
      tag: String,
    },
    safeRating: [String],
    tags: [
      {
        _id: false,
        name: String,
        tag: String,
      },
    ],
    wordsCount: Number,
    publishDate: String,
    lastUpdate: String,
    reviewsCount: Number,
    commentsCount: Number,
    followersCount: Number,
    catchPhrase: String,
    catchPhraseAuthor: String,
    introduction: String,
    points: Number,
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

KakuyomuSchema.set('toJSON', { virtuals: true });

const Kakuyomu = mongoose.model('Kakuyomu', KakuyomuSchema, 'Kakuyomu');

export default Kakuyomu;
