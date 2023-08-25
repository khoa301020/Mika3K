import mongoose from 'mongoose';
import { CommonConstants } from '../constants/index.js';

const NotifyChannelSchema = new mongoose.Schema({
  guildId: {
    type: String,
  },
  channelId: {
    type: String,
  },
  notifyType: {
    type: String,
    enum: Object.values(CommonConstants.NOTIFY_TYPE),
  },
});

NotifyChannelSchema.set('toJSON', { virtuals: true });

const NotifyChannel = mongoose.model('NotifyChannel', NotifyChannelSchema, 'NotifyChannels');

export default NotifyChannel;
