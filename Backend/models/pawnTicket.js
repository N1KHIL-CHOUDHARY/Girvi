const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../services/encryption.js');

// --- Item Schema ---
// Only encrypt the 'name' and 'description'
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    set: encrypt,
    get: decrypt
  },
  type: {
    type: String,
    default: 'gold'
  },
  weight_grams: {
    type: Number,
    required: true
    // REMOVED ENCRYPTION
  },
  purity: {
    type: Number
    // REMOVED ENCRYPTION
  },
  description: {
    type: String,
    set: encrypt,
    get: decrypt
  },
  item_photo_url: {
    type: String
  }
}, { _id: false, toJSON: { getters: true }, toObject: { getters: true } }); // Added getters


// --- PawnTicket Schema ---
// We only encrypt the 'ticket_number'
const pawnTicketSchema = new mongoose.Schema({
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    index: true,
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
  },
  created_by_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ticket_number: {
    type: String,
    required: true,
    set: encrypt, // Encrypt the ticket number
    get: decrypt
  },
  loan_amount: {
    type: Number,
    required: true
    // REMOVED ENCRYPTION
  },
  interest_rate: {
    type: Number, 
    required: true
    // REMOVED ENCRYPTION
  },
  adv_amount: {
    type: Number,
    required: true
    // REMOVED ENCRYPTION
  },
  pawned_date: {
    type: Date,
    required: true,
    default: Date.now
    // REMOVED ENCRYPTION
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'settled', 'defaulted'],
    default: 'active'
    // REMOVED ENCRYPTION
  },
  settled_date: {
    type: Date,
  },
  items: [itemSchema], 
}, {
  timestamps: true,
  // IMPORTANT: Tell Mongoose to apply 'getters' when converting to JSON
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('PawnTicket', pawnTicketSchema);