const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['https://alumni-frontend-five.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

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

app.get('/', (req, res) => {
  res.send('Alumni Association Platform API');
});

const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const jobRoutes = require('./routes/jobs');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/user');

app.use('/auth', authRoutes);
app.use('/donations', donationRoutes);
app.use('/jobs', jobRoutes);
app.use('/events', eventRoutes);
app.use('/user', userRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.post('/auth/login', async (req, res) => {
  // Your login logic here
  const { email, password } = req.body;
  // ... authenticate user ...
  res.json({ token: 'your_auth_token' });
});

app.post('/auth/forgot-password', async (req, res) => {
  // Implement forgot password logic here
  const { email } = req.body;
  // TODO: Add your forgot password logic
  // For example, send a password reset email
  res.status(200).json({ message: 'Password reset email sent' });
});

// Only start the server if we're not in production (i.e., not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;