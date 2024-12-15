const mongoose = require('mongoose');

// models/User.js

const userSchema = {
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  
  // Academic Information
  graduationYear: {
    type: Number,
    required: true,
    min: 1900,
    max: 2100
  },
  major: {
    type: String,
    required: true,
    trim: true
  },
  
  // Professional Information
  currentJob: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Account Management
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}


module.exports = mongoose.model('User', userSchema);