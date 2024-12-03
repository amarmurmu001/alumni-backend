const express = require('express');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

const router = express.Router();

// POST route to create a new job
router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, 
      company, 
      location, 
      description, 
      requirements, 
      salary, 
      type,
      applicationDeadline 
    } = req.body;

    // Validate required fields
    if (!title || !company || !location || !description || !requirements || !type || !applicationDeadline) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Ensure requirements is an array
    const requirementsArray = Array.isArray(requirements) ? requirements : [requirements];

    const newJob = new Job({
      title,
      company,
      location,
      description,
      requirements: requirementsArray,
      salary,
      type,
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

// GET route to fetch jobs with optional filters
router.get('/', async (req, res) => {
  try {
    const { type, location, company } = req.query;
    const query = {};

    // Add filters if provided
    if (type) query.type = type;
    if (location) query.location = new RegExp(location, 'i');
    if (company) query.company = new RegExp(company, 'i');

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate('postedBy', 'firstName lastName');
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// GET route to fetch a single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
});

// PUT route to update a job
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the user is the one who posted the job
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const { 
      title, 
      company, 
      location, 
      description, 
      requirements, 
      salary, 
      type,
      applicationDeadline 
    } = req.body;

    // Ensure requirements is an array
    const requirementsArray = Array.isArray(requirements) ? requirements : [requirements];

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title,
        company,
        location,
        description,
        requirements: requirementsArray,
        salary,
        type,
        applicationDeadline
      },
      { new: true }
    );

    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
});

// DELETE route to remove a job
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the user is the one who posted the job
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.remove();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
});

module.exports = router;