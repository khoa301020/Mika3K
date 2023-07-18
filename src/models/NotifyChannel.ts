import mongoose from 'mongoose';

const NotifyChannelSchema = new mongoose.Schema({
  guildId: {
    type: String,
  },
  channelId: {
    type: String,
  },
  notifyType: {
    type: String,
  },
});

NotifyChannelSchema.set('toJSON', { virtuals: true });

const NotifyChannel = mongoose.model('NotifyChannel', NotifyChannelSchema, 'NotifyChannels');

export default NotifyChannel;
