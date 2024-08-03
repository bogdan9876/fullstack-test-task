const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
