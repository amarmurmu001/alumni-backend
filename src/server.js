const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Import route modules
const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const jobRoutes = require('./routes/jobs');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/user');

dotenv.config();

const app = express();

// Move CORS configuration before any route definitions
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'https://alumni-frontend-five.vercel.app'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.path}`);
  next();
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Update your routes to include the /api prefix

app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/user', userRoutes);

// Update other routes as needed
app.get('/', (req, res) => {
  res.send('Alumni Association Platform API');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.post('/api/auth/login', async (req, res) => {
  // Your login logic here
});

app.post('/api/auth/forgot-password', async (req, res) => {
  // Your forgot password logic here
});

// Only start the server if we're not in production (i.e., not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Add a test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Add this near the end of the file, after all route definitions
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;