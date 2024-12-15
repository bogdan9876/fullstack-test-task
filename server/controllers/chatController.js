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
    chat.createdAt = chat.createdAt.toISOString();
    chat.updatedAt = chat.updatedAt.toISOString();
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
    chats.forEach(chat => {
      chat.createdAt = chat.createdAt.toISOString();
      chat.updatedAt = chat.updatedAt.toISOString();
      chat.messages.forEach(msg => {
        msg.createdAt = msg.createdAt.toISOString();
        msg.updatedAt = msg.updatedAt.toISOString();
      });
    });

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

    chat.createdAt = chat.createdAt.toISOString();
    chat.updatedAt = chat.updatedAt.toISOString();
    chat.messages.forEach(msg => {
      msg.createdAt = msg.createdAt.toISOString();
      msg.updatedAt = msg.updatedAt.toISOString();
    });
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

    const newMessage = { sender, text, isQuote: false }; // Set isQuote to false
    chat.messages.push(newMessage);
    await chat.save();

    const formattedMessages = chat.messages.map(msg => ({
      ...msg.toObject(),
      createdAt: msg.createdAt.toISOString(),
      updatedAt: msg.updatedAt.toISOString(),
    }));

    res.status(201).json({ message: 'Message sent successfully', newMessage: formattedMessages[formattedMessages.length - 1] });
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

    let systemUser = await User.findOne({ username: 'system' });
    if (!systemUser) {
      systemUser = new User({ username: 'system', email: 'system@example.com', password: 'defaultPassword' });
      await systemUser.save();
    }

    const quoteMessage = { sender: systemUser._id, text: quote, isQuote: true };
    chat.messages.push(quoteMessage);
    await chat.save();

    const formattedMessages = chat.messages.map(msg => ({
      ...msg.toObject(),
      createdAt: msg.createdAt ? msg.createdAt.toISOString() : null,
      updatedAt: msg.updatedAt ? msg.updatedAt.toISOString() : null,
    }));

    res.status(201).json({ message: 'Quote sent successfully', quoteMessage: formattedMessages[formattedMessages.length - 1] });
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
    updatedChat.createdAt = updatedChat.createdAt.toISOString();
    updatedChat.updatedAt = updatedChat.updatedAt.toISOString();
    res.json(updatedChat);
  } catch (err) {
    console.error('Error updating chat name:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const editMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { text } = req.body;
    const sender = req.user.id;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== sender) {
      return res.status(403).json({ error: 'You can only edit your own messages' });
    }

    message.text = text;
    await chat.save();

    res.status(200).json({ message: 'Message edited successfully', updatedMessage: message });
  } catch (err) {
    console.error('Error editing message:', err);
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
  editMessage
};
