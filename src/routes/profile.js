const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Update current user's profile
router.put('/me', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      graduationYear,
      major,
      currentJob,
      location
    } = req.body;

    // Build update object with only provided fields
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (graduationYear) updateFields.graduationYear = parseInt(graduationYear);
    if (major) updateFields.major = major;
    if (currentJob !== undefined) updateFields.currentJob = currentJob;
    if (location !== undefined) updateFields.location = location;

    // If email is being updated, check if it's already in use
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    // Update the user profile
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { 
        new: true, 
        runValidators: true,
        select: '-password -verificationToken -resetPasswordToken -resetPasswordExpires'
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
});

// Get user profile by ID (for public viewing)
router.get('/:id', async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.id)
      .select('firstName lastName graduationYear major currentJob location');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const { 
      query, 
      graduationYear, 
      major,
      page = 1,
      limit = 10
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    // Build search query
    const searchQuery = {};
    
    if (query) {
      const searchRegex = new RegExp(query.trim(), 'i');
      searchQuery.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { currentJob: searchRegex },
        { location: searchRegex }
      ];
    }

    if (graduationYear) searchQuery.graduationYear = parseInt(graduationYear);
    if (major) searchQuery.major = new RegExp(major, 'i');

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .select('firstName lastName graduationYear major currentJob location')
        .sort({ lastName: 1, firstName: 1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(searchQuery)
    ]);

    res.json({
      users,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalUsers: total,
      limit: limitNum
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
});

module.exports = router; 