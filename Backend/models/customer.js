const mongoose = require('mongoose');
const { Schema } = mongoose;

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
  phone: {
    type: String,
    required: true,
    // We will add encryption here later
  },
  address: {
    line1: { type: String },
    city: { type: String, trim: true },
    pincode: { type: String, trim: true }, // For area-wise analytics
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'], // For gender analytics
  },
  customer_photo_url: {
    type: String, // URL from S3/Cloudinary
  },
  aadhaar_number: {
    type: String,
    // We will add encryption here later
  },
  pan_number: {
    type: String,
    // We will add encryption here later
  },
  created_by_user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);