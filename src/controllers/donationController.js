// controllers/donationController.js
const crypto = require('crypto');
const Donation = require('../models/Donation');
const razorpay = require('../config/razorpay');

// Create a new donation order
exports.createOrder = async (req, res) => {
  try {
    const { amount, isAnonymous = false, donorInfo } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise and ensure it's an integer
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    
    // Create a pending donation record
    const donation = new Donation({
      userId: isAnonymous ? null : req.user.id,
      amount,
      razorpayOrderId: order.id,
      isAnonymous,
      status: 'pending',
      donorInfo: isAnonymous ? null : {
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        phone: donorInfo?.phone || ''
      }
    });

    await donation.save();

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      donation: {
        id: donation._id,
        amount: donation.amount,
        status: donation.status
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      message: 'Failed to create order', 
      error: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : undefined
    });
  }
};

// Verify payment after successful payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification parameters' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Find the donation record
    const donation = await Donation.findOne({ razorpayOrderId: razorpay_order_id });
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation record not found' });
    }

    // Verify payment status with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== 'captured') {
      donation.status = 'failed';
      await donation.save();
      return res.status(400).json({ message: 'Payment not captured' });
    }

    // Update donation record
    donation.razorpayPaymentId = razorpay_payment_id;
    donation.status = 'completed';
    donation.paymentDetails = {
      method: payment.method,
      email: payment.email,
      contact: payment.contact
    };

    await donation.save();

    res.json({
      message: 'Payment verified successfully',
      donation: {
        id: donation._id,
        amount: donation.amount,
        status: donation.status,
        createdAt: donation.createdAt
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

// Get donation progress
exports.getDonationProgress = async (req, res) => {
  try {
    const total = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const goal = process.env.DONATION_GOAL || 1000000;
    const currentTotal = total[0]?.total || 0;

    res.json({
      total: currentTotal,
      goal: parseInt(goal),
      percentage: (currentTotal / parseInt(goal)) * 100,
      remainingAmount: parseInt(goal) - currentTotal
    });
  } catch (error) {
    console.error('Get donation progress error:', error);
    res.status(500).json({ message: 'Failed to fetch donation progress', error: error.message });
  }
};

// Get donation history
exports.getDonationHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [donations, total] = await Promise.all([
      Donation.find({ status: 'completed' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName')
        .select('-paymentDetails'),
      Donation.countDocuments({ status: 'completed' })
    ]);

    res.json({
      donations: donations.map(d => ({
        ...d.toJSON(),
        donorName: d.isAnonymous ? 'Anonymous' : d.donorInfo?.name || `${d.userId?.firstName} ${d.userId?.lastName}`
      })),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDonations: total
    });
  } catch (error) {
    console.error('Get donation history error:', error);
    res.status(500).json({ message: 'Failed to fetch donation history', error: error.message });
  }
};

// Get user's donation history
exports.getUserDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      userId: req.user.id,
      status: { $in: ['completed', 'pending'] }
    })
    .sort({ createdAt: -1 })
    .select('-paymentDetails');

    res.json(donations);
  } catch (error) {
    console.error('Get user donations error:', error);
    res.status(500).json({ message: 'Failed to fetch user donations', error: error.message });
  }
};