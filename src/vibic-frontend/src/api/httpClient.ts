import axios from 'axios';

export const http = axios.create({
//   baseURL: 'https://localhost:7154',
  withCredentials: false, 
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
