const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  referralCode: {
    type: String,
    unique: true
  },
  referredBy: {
    type: String,
    default: null
  },
  referralCount: {
    type: Number,
    default: 0
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

function generateReferralCode(name) {
  const prefix = name.substring(0, 4).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return prefix + random;
}

UserSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = generateReferralCode(this.name);
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);