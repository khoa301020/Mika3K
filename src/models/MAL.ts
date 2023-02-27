import mongoose from 'mongoose';

const MALSchema = new mongoose.Schema({
  guild: {
    type: String,
    require: true,
  },
  user: {
    type: String,
    require: true,
  },
  codeChallenge: {
    type: String,
    require: false,
  },
  accessToken: {
    type: String,
    require: false,
  },
  refreshToken: {
    type: String,
    require: false,
  },
  followingAnimes: {
    type: [String],
    require: false,
    default: [],
  },
  followingMangas: {
    type: [String],
    require: false,
    default: [],
  },
  lastCheckIncoming: {
    type: Date,
    require: true,
    default: Date.now,
  },
});

MALSchema.set('toJSON', { virtuals: true });

const Quote = mongoose.model('MAL', MALSchema, 'MAL');

export default Quote;
