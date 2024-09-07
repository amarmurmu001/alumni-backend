const express = require('express');
const Donation = require('../models/Donation'); // You'll need to create this model
const auth = require('../middleware/auth');

const router = express.Router();

// POST route to create a new donation
router.post('/', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const newDonation = new Donation({
      amount,
      donor: req.user.id
    });
    const savedDonation = await newDonation.save();
    res.status(201).json(savedDonation);
  } catch (error) {
    console.error('Error processing donation:', error);
    res.status(500).json({ message: 'Error processing donation', error: error.message });
  }
});

// GET route to fetch donations (admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ message: 'Error fetching donations', error: error.message });
  }
});

module.exports = router;