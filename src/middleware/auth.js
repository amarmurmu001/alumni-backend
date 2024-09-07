const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader); // Add this line

    if (!authHeader) {
      throw new Error('No Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token:', token); // Add this line

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Add this line

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error); // Add this line
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = auth;