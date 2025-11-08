// PawnTicket schema
const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'gold',
  },
  weight_grams: {
    type: Number,
    required: true,
  },
  purity: {
    type: Number, // e.g., 22 (for 22-carat)
  },
  description: {
    type: String,
  },
  item_photo_url: {
    type: String,
  },
}, { _id: false }); // _id: false means items don't get their own ObjectId

const pawnTicketSchema = new Schema({
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
    index: true,
  },
  created_by_user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ticket_number: {
    type: String,
    required: true,
    // We will need to add logic to make this unique *per shop*
  },
  loan_amount: {
    type: Number,
    required: true,
  },
  interest_rate: {
    type: Number, // Monthly simple interest rate
    required: true,
  },
  adv_amount: {
    type: Number, // 1st month's interest paid in advance
    required: true,
  },
  pawned_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'settled', 'defaulted'],
    default: 'active',
  },
  settled_date: {
    type: Date,
  },
  items: [itemSchema], // An array of items being pawned
}, {
  timestamps: true
});

module.exports = mongoose.model('PawnTicket', pawnTicketSchema);