const User = require('../models/User');
const Chat = require('../models/Chat');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function randomPassword() {
      return Math.random().toString(36).slice(2) +
      Math.random().toString(36)
      .toUpperCase().slice(2);
}

const getOrCreateUser = async (username) => {
  let user = await User.findOne({ username });
  if (!user) {
    user = new User({ username, email: `${username.toLowerCase().replace(/ /g, '')}@mail.ua`, password: randomPassword() });
    await user.save();
  }
  return user;
};

const createPredefinedChats = async (userId) => {
  try {
    const chatNames = ['Alice Freeman', 'Roman Pankevych', 'Hola Madrid'];
    const predefinedUsers = await Promise.all(chatNames.map(name => getOrCreateUser(name)));

    for (let i = 0; i < predefinedUsers.length; i++) {
      const chat = new Chat({
        name: chatNames[i],
        participants: [userId, predefinedUsers[i]._id]
      });
      await chat.save();
    }
  } catch (err) {
    console.error('Error creating predefined chats', err);
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

    res.status(200).json({ message: 'User registered successfully' });
  } catch (err) {
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
      return res.status(400).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ message: 'Login successful', token, refreshToken });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`
    );

    const { email, name, picture = '', id } = googleResponse.data;
    const base64Picture = picture ? await convertImageToBase64(picture) : null;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ username: name, email, password: id, picture: base64Picture });
      await user.save();
      await createPredefinedChats(user._id);
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ message: 'Google Login Successful', token: jwtToken, refreshToken });
  } catch (error) {
    res.status(500).json({ error: 'Google Login Failed' });
  }
};

const convertImageToBase64 = async (imageUrl) => {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  return buffer.toString('base64');
};

const getCurrentUser = async (req, res) => {
  try {
    const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      picture: user.picture
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'No refresh token provided' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    res.status(400).json({ error: 'Invalid refresh token' });
  }
};


module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getCurrentUser,
  randomPassword,
  refreshAccessToken
};
