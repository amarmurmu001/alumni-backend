const express = require('express');
const Job = require('../models/Job'); // You'll need to create this model
const auth = require('../middleware/auth');

const router = express.Router();

// POST route to create a new job
router.post('/', auth, async (req, res) => {
  try {
    const { title, company, location, description, requirements, salary, applicationDeadline } = req.body;
    const newJob = new Job({
      title,
      company,
      location,
      description,
      requirements,
      salary,
      applicationDeadline,
      postedBy: req.user.id
    });
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
});

// GET route to fetch jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).populate('postedBy', 'firstName lastName');
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// GET route to fetch a single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'firstName lastName');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
});

module.exports = router;