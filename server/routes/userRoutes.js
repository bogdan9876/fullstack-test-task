const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/google-login', userController.googleLogin);
router.get('/me', userController.getCurrentUser);

router.get('/profile', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'This is a protected route', user: req.user });
});

router.get('/hello', (req, res) => {
  res.status(200).json({ message: 'Hello world' });
});

module.exports = router;
