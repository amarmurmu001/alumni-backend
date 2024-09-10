const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded.user;
    console.log('Decoded user:', req.user); // New log
    next();
  } catch (err) {
    console.error('Token verification error:', err); // New log
    res.status(401).json({ msg: 'Token is not valid' });
  }
};