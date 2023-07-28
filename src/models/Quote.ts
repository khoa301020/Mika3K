import mongoose from 'mongoose';

const QuoteSchema = new mongoose.Schema({
  guild: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  quote: {
    type: {
      key: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
  },
  private: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

QuoteSchema.set('toJSON', { virtuals: true });

const Quote = mongoose.model('Quote', QuoteSchema, 'quotes');

export default Quote;
