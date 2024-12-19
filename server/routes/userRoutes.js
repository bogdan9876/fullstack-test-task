const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/google-login', userController.googleLogin);
router.get('/me', userController.getCurrentUser);
router.post('/refresh-token', userController.refreshAccessToken);

router.get('/hello', (req, res) => {
  res.status(200).json({ message: 'Hello world' });
});

module.exports = router;
