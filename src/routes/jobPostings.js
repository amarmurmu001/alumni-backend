const express = require('express');
const JobPosting = require('../models/JobPosting');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { title, company, description, location, salary, expiryDate } = req.body;
    const jobPosting = new JobPosting({
      title,
      company,
      description,
      location,
      salary,
      expiryDate,
      postedBy: req.user.id,
    });
    await jobPosting.save();
    res.status(201).json(jobPosting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const jobPostings = await JobPosting.find({ status: 'open' }).populate('postedBy', 'firstName lastName');
    res.json(jobPostings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const jobPosting = await JobPosting.findById(req.params.id).populate('postedBy', 'firstName lastName');
    if (!jobPosting) {
      return res.status(404).json({ error: 'Job posting not found' });
    }
    res.json(jobPosting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;