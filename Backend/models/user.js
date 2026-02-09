// User schema
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema({
  shop_id: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
  },
  role_id: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true, 
  },
  password: {
    type: String,
    required: true,
    minlength: 6, 
  },
  full_name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['owner', 'worker'], 
    default: 'worker',
  },
  language: {
    type: String,
    enum: ["en", "hi", "ta"],
    default: "en"
  },  
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// --- Mongoose "method" ---
// This adds a custom method to all user documents
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);