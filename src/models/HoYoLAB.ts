import mongoose from 'mongoose';

const HoYoLABSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true,
  },
  expiresAt: {
    type: Date,
    require: false,
  },
  hoyoUsers: {
    type: [
      {
        remark: {
          type: String,
          require: true,
          unique: true,
        },
        cookieString: {
          type: String,
          require: true,
        },
        gameAccounts: {
          type: [
            {
              game: {
                type: String,
                require: false,
                enum: ['genshin', 'hsr', 'hi3'],
              },
              game_biz: String,
              region: String,
              game_uid: String,
              nickname: String,
              level: Number,
              is_chosen: Boolean,
              region_name: String,
              is_official: Boolean,
            },
          ],
          require: true,
        },
      },
    ],
  },
});

HoYoLABSchema.set('toJSON', { virtuals: true });

const HoYoLAB = mongoose.model('HoYoLAB', HoYoLABSchema, 'HoYoLAB');

export default HoYoLAB;
