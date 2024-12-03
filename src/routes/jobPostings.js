const express = require('express');
const JobPosting = require('../models/JobPosting');
const auth = require('../middleware/auth');
const router = express.Router();

// Validation middleware for date
const validateDate = (req, res, next) => {
  const { applicationDeadline } = req.body;
  if (applicationDeadline) {
    const deadline = new Date(applicationDeadline);
    if (isNaN(deadline.getTime())) {
      return res.status(400).json({ message: 'Invalid application deadline date format' });
    }
    if (deadline < new Date()) {
      return res.status(400).json({ message: 'Application deadline must be a future date' });
    }
  }
  next();
};

// Create a new job posting
router.post('/', [auth, validateDate], async (req, res) => {
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

    // Validate job type
    const validTypes = ['full-time', 'part-time', 'contract', 'internship'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid job type' });
    }

    // Ensure requirements is an array and not empty
    const requirementsArray = Array.isArray(requirements) ? requirements : [requirements];
    if (requirementsArray.length === 0) {
      return res.status(400).json({ message: 'At least one requirement must be provided' });
    }

    const jobPosting = new JobPosting({
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

    const savedJobPosting = await jobPosting.save();
    res.status(201).json(savedJobPosting);
  } catch (error) {
    console.error('Error creating job posting:', error);
    res.status(500).json({ message: 'Error creating job posting', error: error.message });
  }
});

// Get job postings by user (Must be before /:id route)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const jobPostings = await JobPosting.find({ postedBy: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('postedBy', 'firstName lastName');
    
    res.json(jobPostings);
  } catch (error) {
    console.error('Error fetching user job postings:', error);
    res.status(500).json({ message: 'Error fetching user job postings', error: error.message });
  }
});

// Get all job postings with filters
router.get('/', async (req, res) => {
  try {
    const {
      type,
      location,
      company,
      status,
      search,
      page = 1,
      limit = 10
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Limit between 1 and 50

    const query = { status: { $ne: 'expired' } }; // Default to exclude expired jobs

    // Add filters if provided
    if (type) {
      const validTypes = ['full-time', 'part-time', 'contract', 'internship'];
      if (validTypes.includes(type)) {
        query.type = type;
      }
    }
    if (location) query.location = new RegExp(location, 'i');
    if (company) query.company = new RegExp(company, 'i');
    if (status && ['active', 'closed', 'expired'].includes(status)) {
      query.status = status;
    }
    
    // Add search functionality across multiple fields
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { company: searchRegex },
        { location: searchRegex }
      ];
    }

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    const [jobPostings, total] = await Promise.all([
      JobPosting.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('postedBy', 'firstName lastName'),
      JobPosting.countDocuments(query)
    ]);

    res.json({
      jobPostings,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalJobs: total,
      limit: limitNum
    });
  } catch (error) {
    console.error('Error fetching job postings:', error);
    res.status(500).json({ message: 'Error fetching job postings', error: error.message });
  }
});

// Get a single job posting
router.get('/:id', async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid job posting ID format' });
    }

    const jobPosting = await JobPosting.findById(req.params.id)
      .populate('postedBy', 'firstName lastName');
    
    if (!jobPosting) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.json(jobPosting);
  } catch (error) {
    console.error('Error fetching job posting:', error);
    res.status(500).json({ message: 'Error fetching job posting', error: error.message });
  }
});

// Update a job posting
router.put('/:id', [auth, validateDate], async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid job posting ID format' });
    }

    const jobPosting = await JobPosting.findById(req.params.id);
    
    if (!jobPosting) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    // Check if the user is authorized to update
    if (jobPosting.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this job posting' });
    }

    const {
      title,
      company,
      location,
      description,
      requirements,
      salary,
      type,
      applicationDeadline,
      status
    } = req.body;

    // Validate job type
    const validTypes = ['full-time', 'part-time', 'contract', 'internship'];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid job type' });
    }

    // Validate status
    if (status && !['active', 'closed', 'expired'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Ensure requirements is an array and not empty
    const requirementsArray = Array.isArray(requirements) ? requirements : [requirements];
    if (requirementsArray.length === 0) {
      return res.status(400).json({ message: 'At least one requirement must be provided' });
    }

    const updatedJobPosting = await JobPosting.findByIdAndUpdate(
      req.params.id,
      {
        title,
        company,
        location,
        description,
        requirements: requirementsArray,
        salary,
        type,
        applicationDeadline,
        status,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    res.json(updatedJobPosting);
  } catch (error) {
    console.error('Error updating job posting:', error);
    res.status(500).json({ message: 'Error updating job posting', error: error.message });
  }
});

// Delete a job posting
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid job posting ID format' });
    }

    const jobPosting = await JobPosting.findById(req.params.id);
    
    if (!jobPosting) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    // Check if the user is authorized to delete
    if (jobPosting.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job posting' });
    }

    await jobPosting.deleteOne();
    res.json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    console.error('Error deleting job posting:', error);
    res.status(500).json({ message: 'Error deleting job posting', error: error.message });
  }
});

module.exports = router;