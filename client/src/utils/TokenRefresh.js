import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token found');

    const response = await axios.post(`${API_URL}/users/refresh-token`, { refreshToken });
    const { token, refreshToken: newRefreshToken } = response.data;

    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', newRefreshToken);

    return token;
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    throw new Error('Session expired. Please log in again.');
  }
};

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('accessToken');

  if (!token) {
    throw new Error('No access token available');
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAuthToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        throw refreshError;
      }
    }

    throw error;
  }
);

export default apiClient;
