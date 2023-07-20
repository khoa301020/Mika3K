import mongoose from 'mongoose';

const HoYoLABSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true,
  },
  accountId: {
    type: String,
    require: false,
  },
  cookieToken: {
    type: String,
    require: false,
  },
  cookieString: {
    type: String,
    require: false,
  },
  expiresAt: {
    type: Date,
    require: false,
  },
  genshinAccount: {
    _id: false,
    type: {
      game_biz: String,
      region: String,
      game_uid: String,
      nickname: String,
      level: Number,
      is_chosen: Boolean,
      region_name: String,
      is_official: Boolean,
    },
    required: false,
  },
  hsrAccount: {
    _id: false,
    type: {
      game_biz: String,
      region: String,
      game_uid: String,
      nickname: String,
      level: Number,
      is_chosen: Boolean,
      region_name: String,
      is_official: Boolean,
    },
    required: false,
  },
});

HoYoLABSchema.set('toJSON', { virtuals: true });

const HoYoLAB = mongoose.model('HoYoLAB', HoYoLABSchema, 'HoYoLAB');

export default HoYoLAB;
