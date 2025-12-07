const mongoose = require('mongoose');
const { Schema } = mongoose;
const { encrypt, decrypt } = require('../services/encryption.js');

const customerSchema = new Schema({
  shop_id: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    index: true,
  },
  full_name: {
    type: String,
    required: true,
    trim: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  address: {
    line1: { 
      type: String,
    },
    city: { type: String, trim: true },
    pincode: { type: String, trim: true }, 
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  customer_photo_url: {
    type: String,
  },
  aadhaar_number: {
    type: String,
    set: encrypt, 
    get: decrypt 
  },
  pan_number: {
    type: String,
    set: encrypt, 
    get: decrypt 
  },
  created_by_user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('Customer', customerSchema);