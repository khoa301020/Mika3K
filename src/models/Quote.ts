import mongoose from 'mongoose';

const QuoteSchema = new mongoose.Schema({
  guild: {
    type: String,
    require: true,
  },
  user: {
    type: String,
    require: true,
  },
  quote: {
    type: {
      key: {
        type: String,
        require: true,
      },
      value: {
        type: String,
        require: true,
      },
    },
  },
  private: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    require: true,
  },
});

QuoteSchema.set('toJSON', { virtuals: true });

const Quote = mongoose.model('Quote', QuoteSchema, 'quotes');

export default Quote;
