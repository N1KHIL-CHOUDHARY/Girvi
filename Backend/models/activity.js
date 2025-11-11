const mongoose = require('mongoose');
const { Schema } = mongoose;

const activitySchema = new Schema({
  shop_id: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    index: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customer_id: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
  },
  ticket_id: {
    type: Schema.Types.ObjectId,
    ref: 'PawnTicket',
  },
  type: {
    type: String,
    required: true,
    enum: [
      'NEW_CUSTOMER',
      'UPDATED_CUSTOMER', // <-- ADDED
      'DELETED_CUSTOMER', // <-- ADDED
      'NEW_TICKET',
      'UPDATED_TICKET',   // <-- ADDED
      'SETTLED_TICKET',
      'DELETED_TICKET',
      'NEW_PAYMENT'
    ],
  },
  message: {
    type: String,
    required: true,
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Activity', activitySchema);