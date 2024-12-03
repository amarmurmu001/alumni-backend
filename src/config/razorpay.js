const Razorpay = require('razorpay');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  if (isDevelopment) {
    console.warn('Warning: RAZORPAY_KEY_ID and/or RAZORPAY_KEY_SECRET not found in environment variables.');
    console.warn('Using test mode with default test keys.');
    // Use Razorpay test keys for development
    RAZORPAY_KEY_ID = 'rzp_test_K4rTfT3JSI2JKu';
    RAZORPAY_KEY_SECRET = 'iu7Xp9Aad8mb0MhwrM52pELg';
  } else {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be provided in environment variables');
  }
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

// Test the configuration
razorpay.payments.all()
  .then(() => console.log('Razorpay configuration successful'))
  .catch(err => {
    console.error('Razorpay configuration error:', err.message);
    if (isDevelopment) {
      console.warn('Continuing in development mode despite Razorpay error');
    } else {
      throw err;
    }
  });

module.exports = razorpay; 