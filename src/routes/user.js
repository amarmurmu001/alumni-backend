const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  console.log('Profile route hit');
  console.log('User from token:', req.user);
  
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found:', user);
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      graduationYear: user.graduationYear,
      major: user.major
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;