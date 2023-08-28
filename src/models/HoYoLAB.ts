import mongoose from 'mongoose';

const HoYoLABSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: false,
  },
  hoyoUsers: {
    type: [
      {
        remark: {
          type: String,
          required: false,
          unique: true,
        },
        cookieString: {
          type: String,
          required: true,
        },
        gameAccounts: {
          type: [
            {
              _id: false,
              game: {
                type: String,
                enum: ['genshin', 'hsr', 'hi3'],
              },
              game_biz: {
                type: String,
                required: true,
              },
              region: {
                type: String,
                required: true,
              },
              game_uid: {
                type: String,
                required: true,
                unique: true,
              },
              nickname: {
                type: String,
                required: true,
              },
              level: {
                type: Number,
                required: true,
              },
              is_chosen: {
                type: Boolean,
                required: true,
              },
              region_name: {
                type: String,
                required: true,
              },
              is_official: {
                type: Boolean,
                required: true,
              },
            },
          ],
          required: true,
        },
      },
    ],
  },
  receiveNotify: {
    type: Boolean,
    required: false,
    default: true,
  },
});

HoYoLABSchema.set('toJSON', { virtuals: true });

const HoYoLAB = mongoose.model('HoYoLAB', HoYoLABSchema, 'HoYoLAB');

export default HoYoLAB;
