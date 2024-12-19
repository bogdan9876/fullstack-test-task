import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'An error occurred during login.');
  }
};

export const googleLoginRequest = async (googleToken) => {
  try {
    const response = await axios.post(`${API_URL}/users/google-login`, {
      token: googleToken,
    });
    return response.data;
  } catch (error) {
    throw new Error('Google Login failed: ' + error.message);
  }
};