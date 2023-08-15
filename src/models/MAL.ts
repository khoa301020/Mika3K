import mongoose from 'mongoose';

const MALSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  codeChallenge: {
    type: String,
    required: false,
  },
  accessToken: {
    type: String,
    required: false,
  },
  refreshToken: {
    type: String,
    required: false,
  },
  expiresAt: {
    type: Date,
    reqire: false,
    default: null,
  },
  followingAnimes: {
    type: [String],
    required: false,
    default: [],
  },
  followingMangas: {
    type: [String],
    required: false,
    default: [],
  },
  lastCheckIncoming: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

MALSchema.set('toJSON', { virtuals: true });

const MAL = mongoose.model('MAL', MALSchema, 'MAL');

export default MAL;
