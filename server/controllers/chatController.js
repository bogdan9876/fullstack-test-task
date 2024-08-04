const Chat = require('../models/Chat');
const User = require('../models/User');
const axios = require('axios');

const createChat = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const creatorId = req.user.id;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'Both first name and last name are required' });
    }

    const name = `${firstName} ${lastName}`.toLowerCase().replace(/\s+/g, '');

    let user = await User.findOne({ username: name });
    if (!user) {
      user = new User({ username: name, email: `${name}@example.com`, password: 'defaultPassword' });
      await user.save();
    }

    const participants = [creatorId, user._id];

    const existingChat = await Chat.findOne({
      participants: { $all: participants }
    });

    if (existingChat) {
      return res.status(200).json({ message: 'Chat already exists', chat: existingChat });
    }

    const chat = new Chat({ name: `${firstName} ${lastName}`, participants });
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

    const newMessage = { sender, text };
    chat.messages.push(newMessage);
    await chat.save();

    res.status(201).json({ message: 'Message sent successfully', newMessage });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const sendQuote = async (req, res) => {
  try {
    const { chatId } = req.params;
    const sender = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const response = await axios.get('https://zenquotes.io/api/random');
    const quote = response.data[0].q;
    const quoteMessage = { sender, text: `Quote: ${quote}` };
    chat.messages.push(quoteMessage);
    await chat.save();

    res.status(201).json({ message: 'Quote sent successfully', quoteMessage });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Chat.findByIdAndDelete(chatId);
    res.status(200).send('Chat deleted successfully');
  } catch (err) {
    console.error('Error deleting chat:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const updateChatName = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { name } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(chatId, { name }, { new: true });
    res.json(updatedChat);
  } catch (err) {
    console.error('Error updating chat name:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

module.exports = {
  createChat,
  sendQuote,
  getUserChats,
  getChatMessages,
  sendMessage,
  deleteChat,
  updateChatName,
};
