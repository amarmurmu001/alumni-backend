// routes/donations.js
const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const auth = require('../middleware/auth');

// Create a new donation order
router.post('/create-order', auth, donationController.createOrder);

// Verify payment after successful payment
router.post('/verify-payment', auth, donationController.verifyPayment);

// Get donation progress (public route)
router.get('/progress', donationController.getDonationProgress);

// Get donation history (protected route)
router.get('/history', auth, donationController.getDonationHistory);

// Get user's donation history (protected route)
router.get('/my-donations', auth, donationController.getUserDonations);

module.exports = router;