const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

const userRoutes = {
  // GET /api/user/profile
  getProfile: async (req, res) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        graduationYear: user.graduationYear,
        major: user.major,
        currentJob: user.currentJob,
        location: user.location
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // PUT /api/user/profile
  updateProfile: async (req, res) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const { firstName, lastName, currentJob, location, major, graduationYear } = req.body;

      // Build update object with only provided fields
      const updateFields = {};
      if (firstName) updateFields.firstName = firstName;
      if (lastName) updateFields.lastName = lastName;
      if (currentJob) updateFields.currentJob = currentJob;
      if (location) updateFields.location = location;
      if (major) updateFields.major = major;
      if (graduationYear) updateFields.graduationYear = graduationYear;

      // Update user with new fields
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        graduationYear: user.graduationYear,
        major: user.major,
        currentJob: user.currentJob,
        location: user.location
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // POST /api/user/verify-email
  verifyEmail: async (req, res) => {
    try {
      const { verificationToken } = req.body;

      if (!verificationToken) {
        return res.status(400).json({ error: 'Verification token is required' });
      }

      const user = await User.findOne({ verificationToken });

      if (!user) {
        return res.status(400).json({ error: 'Invalid verification token' });
      }

      // Update user verification status
      user.isVerified = true;
      user.verificationToken = undefined; // Remove the token after verification
      await user.save();

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

// Register routes
router.get('/profile', auth, userRoutes.getProfile);
router.put('/profile', auth, userRoutes.updateProfile);
router.post('/verify-email', userRoutes.verifyEmail);

module.exports = router;