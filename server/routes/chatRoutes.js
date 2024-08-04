const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, chatController.createChat);
router.get('/', authMiddleware, chatController.getUserChats);
router.get('/:chatId/messages', authMiddleware, chatController.getChatMessages);
router.post('/:chatId/messages', authMiddleware, chatController.sendMessage);
router.delete('/:chatId', authMiddleware, chatController.deleteChat);
router.put('/:chatId', authMiddleware, chatController.updateChatName);
router.post('/:chatId/quote', authMiddleware, chatController.sendQuote);

module.exports = router;
