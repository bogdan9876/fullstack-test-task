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

    const refreshToken = req.headers['x-refresh-token'];

    if (!refreshToken) {
      return res.status(401).json({ error: 'Unauthorized, no refresh token provided' });
    }

    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);
      req.user = await User.findById(decodedRefresh.id);
      
      if (!req.user) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const newAccessToken = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.setHeader('x-access-token', newAccessToken);
      next();
    } catch (err) {
      console.error('Error refreshing token:', err);
      res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  }
};

module.exports = authMiddleware;
