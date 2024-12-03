const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  company: { 
    type: String, 
    required: true,
    trim: true,
    minlength: [2, 'Company name must be at least 2 characters long'],
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: { 
    type: String, 
    required: true,
    trim: true,
    minlength: [2, 'Location must be at least 2 characters long'],
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  requirements: { 
    type: [String], 
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0 && v.every(req => req.trim().length >= 3);
      },
      message: 'At least one requirement with minimum 3 characters is required'
    }
  },
  salary: { 
    type: String,
    trim: true,
    maxlength: [50, 'Salary information cannot exceed 50 characters']
  },
  type: { 
    type: String, 
    required: true, 
    enum: {
      values: ['full-time', 'part-time', 'contract', 'internship'],
      message: '{VALUE} is not a valid job type'
    }
  },
  applicationDeadline: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Application deadline must be a future date'
    }
  },
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  status: { 
    type: String, 
    enum: {
      values: ['active', 'closed', 'expired'],
      message: '{VALUE} is not a valid status'
    }, 
    default: 'active',
    index: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for common queries
jobPostingSchema.index({ status: 1, applicationDeadline: 1, createdAt: -1 });
jobPostingSchema.index({ company: 1, status: 1 });
jobPostingSchema.index({ type: 1, status: 1 });
jobPostingSchema.index({ location: 1, status: 1 });

// Text index for search functionality
jobPostingSchema.index({ 
  title: 'text', 
  company: 'text', 
  description: 'text', 
  location: 'text' 
});

// Pre-save middleware to update timestamps
jobPostingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for checking if job is expired
jobPostingSchema.virtual('isExpired').get(function() {
  return new Date() > this.applicationDeadline;
});

// Method to check if a job can be applied to
jobPostingSchema.methods.canApply = function() {
  return this.status === 'active' && !this.isExpired;
};

module.exports = mongoose.model('JobPosting', jobPostingSchema);