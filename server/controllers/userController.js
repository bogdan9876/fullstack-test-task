const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const getOrCreateUser = async (username) => {
  let user = await User.findOne({ username });
  if (!user) {
    user = new User({ username, email: `${username}@example.com`, password: 'password' });
    await user.save();
  }
  return user;
};

const createPredefinedChats = async (userId) => {
  try {
    const usernames = ['alice watson', 'Roman pank', 'shura 1'];
    const predefinedUsers = await Promise.all(usernames.map(username => getOrCreateUser(username)));

    for (const user of predefinedUsers) {
      const chat = new Chat({
        participants: [userId, user._id]
      });
      await chat.save();
    }
  } catch (err) {
    console.error('Error creating predefined chats:', err);
  }
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    await createPredefinedChats(newUser._id);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
