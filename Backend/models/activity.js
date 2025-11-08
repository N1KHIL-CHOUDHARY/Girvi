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
  // We'll link to the specific document for clickable links
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
      'NEW_TICKET', 
      'NEW_PAYMENT', 
      'SETTLED_TICKET',
      'DELETED_TICKET'
    ],
  },
  message: {
    type: String, // e.g., "John D created a new loan of ₹50,000 for Jane S."
    required: true,
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // We only care about when it was created
});

module.exports = mongoose.model('Activity', activitySchema);