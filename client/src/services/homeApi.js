import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const getChats = async (token) => {
  if (!token) {
    throw new Error('No token found');
  }
  const response = await axios.get(`${API_URL}/chats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const getMessages = async (chatId, token) => {
  if (!token) {
    throw new Error('No token found');
  }
  const response = await axios.get(`${API_URL}/chats/${chatId}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.messages;
};

const sendMessage = async (chatId, message, token) => {
  if (!token) {
    throw new Error('No token found');
  }
  const response = await axios.post(`${API_URL}/chats/${chatId}/messages`, { text: message }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.newMessage;
};

const deleteChat = async (chatId, token) => {
  if (!token) {
    throw new Error('No token found');
  }
  await axios.delete(`${API_URL}/chats/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const updateChatName = async (chatId, name, token) => {
  if (!token) {
    throw new Error('No token found');
  }
  const response = await axios.put(`${API_URL}/chats/${chatId}`, { name }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const createChat = async (firstName, lastName, token) => {
  if (!token) {
    throw new Error('No token found');
  }
  const response = await axios.post(`${API_URL}/chats/create`, {
    firstName,
    lastName
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.chat;
};

const quoteMessage = async (chatId, token) => {
  if (!token) {
    throw new Error('No token found');
  }
  const response = await axios.post(`${API_URL}/chats/${chatId}/quote`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.quoteMessage;
};

const updateMessage = async (chatId, messageId, newText, token) => {
  try {
    const response = await axios.put(`${API_URL}/chats/${chatId}/messages/${messageId}`, 
      { text: newText }, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Error updating message: ' + error.response?.data?.error || error.message);
  }
};

const fetchUserData = async (token) => {
  try {
    const { data } = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    throw new Error('Error fetching user data: ' + error.message);
  }
};

export {
  getChats,
  getMessages,
  sendMessage,
  deleteChat,
  updateChatName,
  createChat,
  quoteMessage,
  updateMessage,
  fetchUserData
};
