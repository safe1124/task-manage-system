import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const registerUser = async (username: string, email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/register`, { user_name: username, user_mail: email, user_password: password });
  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, { user_mail: email, user_password: password });
  return {
    access_token: response.data.access_token,
    user_id: response.data.user_id
  };
};

export const sendMessage = async (message: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/chat`, { message }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getMessages = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/chat/history`, {
    headers: { Authorization: `Bearer ${token}` },
  },);
  
  return response.data;
};