const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors());
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

// Add this before your route definitions
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://alumni-frontend-five.vercel.app/',
  credentials: true,
}));

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

// Only start the server if we're not in production (i.e., not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;