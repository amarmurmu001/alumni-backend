const express = require('express');
const Event = require('../models/Event'); // Adjust the path as necessary
const auth = require('../middleware/auth');

const router = express.Router();

// POST route to create a new event
router.post('/', auth, async (req, res) => {
  try {
    console.log('User from auth middleware:', req.user); // Add this line
    const { title, date, location, description } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const newEvent = new Event({
      title,
      date,
      location,
      description,
      organizer: req.user.id
    });

    const savedEvent = await newEvent.save();
    
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Add this route to fetch events
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortField = req.query.sortBy || 'date';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const filterDate = req.query.filterDate;

    let query = {};
    if (filterDate) {
      query.date = { $gte: new Date(filterDate) };
    }

    const totalEvents = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ [sortField]: sortOrder })
      .populate('organizer', 'firstName lastName')
      .skip(skip)
      .limit(limit);

    res.json({
      events,
      currentPage: page,
      totalPages: Math.ceil(totalEvents / limit),
      totalEvents
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Add this route to fetch a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'firstName lastName');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});

router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ error: 'Event is full' });
    }
    event.attendees.push(req.user.id);
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;