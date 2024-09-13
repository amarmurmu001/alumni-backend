const express = require('express');
const Event = require('../models/Event'); // Adjust the path as necessary
const auth = require('../middleware/auth');

const router = express.Router();

// POST route to create a new event
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received event data:', req.body); // Keep this log
    const { title, date, location, description, registrationLink, maxAttendees } = req.body;
    const newEvent = new Event({
      title,
      date,
      location,
      description,
      registrationLink, // Make sure this line is present
      maxAttendees: maxAttendees ? Number(maxAttendees) : undefined,
      organizer: req.user.id
    });
    const savedEvent = await newEvent.save();
    console.log('Saved event:', savedEvent); // Add this log
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
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName')
      .select('title date location description registrationLink maxAttendees attendees'); // Include registrationLink here
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    console.log('Fetched event:', event); // Add this line for debugging
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});

// Add this new route for event registration
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already registered
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Check if event has reached maximum attendees
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event has reached maximum capacity' });
    }

    // Add user to attendees
    event.attendees.push(req.user.id);
    await event.save();

    res.status(200).json({ message: 'Successfully registered for the event' });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Error registering for event', error: error.message });
  }
});

module.exports = router;