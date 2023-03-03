import mongoose from 'mongoose';

const GenshinSchema = new mongoose.Schema({
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
  selectedAccount: {
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

GenshinSchema.set('toJSON', { virtuals: true });

const Genshin = mongoose.model('Genshin', GenshinSchema, 'Genshin');

export default Genshin;
