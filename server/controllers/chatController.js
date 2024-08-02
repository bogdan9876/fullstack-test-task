const Chat = require('../models/Chat');
const axios = require('axios');

const createChat = async (req, res) => {
  try {
    const { participants } = req.body;

    if (!participants || participants.length < 2) {
      return res.status(400).json({ error: 'At least two participants are required' });
    }

    const chat = new Chat({ participants });
    await chat.save();

    res.status(201).json({ message: 'Chat created successfully', chat });
  } catch (err) {
    console.error('Error creating chat:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({ participants: userId }).populate('participants', 'username email');
    res.status(200).json(chats);
  } catch (err) {
    console.error('Error getting user chats:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId).populate('messages.sender', 'username');
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.status(200).json(chat);
  } catch (err) {
    console.error('Error getting chat messages:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const sender = req.user.id;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    chat.messages.push({ sender, text });
    await chat.save();

    const getQuote = async () => {
      try {
        const response = await axios.get('https://zenquotes.io/api/random');
        const quote = response.data[0].q;
        chat.messages.push({ sender: 'system', text: quote });
        await chat.save();
        return chat.messages;
      } catch (error) {
        console.error('Error fetching quote:', error);
        return chat.messages;
      }
    };

    const updatedMessages = await getQuote();
    
    res.status(201).json({ message: 'Message sent successfully', messages: updatedMessages });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

module.exports = {
  createChat,
  getUserChats,
  getChatMessages,
  sendMessage
};
