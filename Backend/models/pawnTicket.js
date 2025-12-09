const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../services/encryption.js');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
   
  },
  type: {
    type: String,
    default: 'gold'
  },
  weight_grams: {
    type: Number,
    required: true
  },
  purity: {
    type: Number
  },
  description: {
    type: String,

  },
  item_photo_url: {
    type: String
  }
}, { _id: false, toJSON: { getters: true }, toObject: { getters: true } }); // Added getters


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
  
  },
  loan_amount: {
    type: Number,
    required: true
  },
  original_loan_amount: {
    type: Number,
    required: true,
    default: function () {
      return this.loan_amount;
    },
  },
  interest_rate: {
    type: Number, 
    required: true
  },
  adv_amount: {
    type: Number,
    required: true
  },
  pawned_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'settled', 'defaulted'],
    default: 'active'
  },
  settled_date: {
    type: Date,
  },
  items: [itemSchema], 
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('PawnTicket', pawnTicketSchema);