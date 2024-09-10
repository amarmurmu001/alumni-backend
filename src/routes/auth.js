const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, graduationYear, major } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }
    user = new User({ email, password, firstName, lastName, graduationYear, major });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  console.log('Login attempt received:', req.body);
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      id: user.id, // Make sure this is included
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      graduationYear: user.graduationYear,
      major: user.major
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
      }
    );
  } catch (err) {
    console.error('Server error during login:', err.message);
    res.status(500).send('Server error');
  }
});

// Add this route if it's not already there
router.post('/logout', (req, res) => {
  try {
    // In a stateless JWT authentication system, we don't need to do anything server-side
    // The client will handle removing the token
    console.log('Logout request received');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Internal server error during logout' });
  }
});

// ... other routes ...

module.exports = router;