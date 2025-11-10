// PawnTicket schema
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { encrypt, decrypt } = require('../services/encryption.js');


const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'gold',
    set: encrypt, // 2. Encrypt on save
    get: decrypt  // 3. Decrypt on find
  },
  weight_grams: {
    type: Number,
    required: true,
    set: encrypt, // 2. Encrypt on save
    get: decrypt  // 3. Decrypt on find
  },
  purity: {
    type: Number, // e.g., 22 (for 22-carat)
    set: encrypt, // 2. Encrypt on save
    get: decrypt  // 3. Decrypt on find
  },
  description: {
    type: String,
    set: encrypt, // 2. Encrypt on save
    get: decrypt  // 3. Decrypt on find
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
    set: encrypt, // 2. Encrypt on save
    get: decrypt  // 3. Decrypt on find
    // We will need to add logic to make this unique *per shop*
  },
  loan_amount: {
    type: Number,
    required: true,
    set: encrypt, // 2. Encrypt on save
    get: decrypt  // 3. Decrypt on find
  },
  interest_rate: {
    type: Number, // Monthly simple interest rate
    required: true,
    set: encrypt, // 2. Encrypt on save
    get: decrypt  // 3. Decrypt on find
  },
  adv_amount: {
    type: Number, // 1st month's interest paid in advance
    required: true,
    set: encrypt, // 2. Encrypt on save
    get: decrypt  // 3. Decrypt on find
  },
  pawned_date: {
    type: Date,
    required: true,
    default: Date.now,
    set: encrypt, // 2. Encrypt on save
    get: decrypt  // 3. Decrypt on find
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'settled', 'defaulted'],
    default: 'active',
    set: encrypt, // 2. Encrypt on save
    get: decrypt  // 3. Decrypt on find
  },
  settled_date: {
    type: Date,
    set: encrypt, // 2. Encrypt on save
    get: decrypt  // 3. Decrypt on find
  },
  items: [itemSchema],
}, {
  timestamps: true
});

module.exports = mongoose.model('PawnTicket', pawnTicketSchema);