import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const registerUser = async (values) => {
  const response = await axios.post(`${API_URL}/users/register`, values, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};
