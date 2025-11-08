// Shop schema
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const shopSchema = new Schema({
  shop_name: {
    type: String,
    required: true,
  },
  owner_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
}, {
  timestamps: true // This automatically adds `createdAt` and `updatedAt`
});

module.exports = mongoose.model('Shop', shopSchema);