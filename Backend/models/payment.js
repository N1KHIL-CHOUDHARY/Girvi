const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
  shop_id: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    index: true,
  },
  customer_id: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  ticket_id: {
    type: Schema.Types.ObjectId,
    ref: 'PawnTicket',
    required: true,
    index: true,
  },
  created_by_user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount_paid: {
    type: Number,
    required: true,
    min: 0
  },
  payment_for: {
    type: String,
    required: true,
    enum: ['interest', 'principal'],
  },
  payment_date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);