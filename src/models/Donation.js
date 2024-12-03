// models/donation.js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required as anonymous donations are allowed
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be at least 1'],
    max: [1000000, 'Amount cannot exceed 1000000']
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String,
    // Will be added after payment verification
    sparse: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentDetails: {
    method: String,
    email: String,
    contact: String
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  donorInfo: {
    name: String,
    email: String,
    phone: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      // If anonymous, remove user details
      if (ret.isAnonymous) {
        delete ret.userId;
        delete ret.donorInfo;
      }
      return ret;
    }
  }
});

// Indexes for better query performance
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ userId: 1, status: 1 });
donationSchema.index({ razorpayOrderId: 1 }, { unique: true });
donationSchema.index({ razorpayPaymentId: 1 }, { sparse: true, unique: true });

// Virtual for formatted amount
donationSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.amount);
});

module.exports = mongoose.model('Donation', donationSchema);