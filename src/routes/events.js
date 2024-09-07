const express = require('express');
const Event = require('../models/Event'); // Adjust the path as necessary
const auth = require('../middleware/auth');

const router = express.Router();

// POST route to create a new event
router.post('/', auth, async (req, res) => {
  try {
    const { title, date, location, description } = req.body;
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
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'asc', filterDate } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (filterDate) {
      query.date = { $gte: new Date(filterDate) };
    }

    const events = await Event.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('organizer', 'firstName lastName');

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page
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