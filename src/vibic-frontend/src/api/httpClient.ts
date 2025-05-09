import axios from 'axios';

export const http = axios.create({
  //   baseURL: 'https://localhost:7154',
  withCredentials: false,
});

http.interceptors.request
  .use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

http.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const { response } = error;

    if (!response) {
      // Нет ответа от сервера (например, оффлайн)
      console.error('Network error:', error.message);
    } else {
      switch (response.status) {
        case 400:
          console.warn('Bad Request', response.data);
          break;
        case 401:
          console.warn('Unauthorized');
          // Возможно, нужно редиректить на логин
          break;
        case 403:
          console.warn('Forbidden');
          break;
        case 404:
          console.warn('Not Found');
          break;
        case 500:
          console.error('Server Error');
          break;
        default:
          console.warn(`Unhandled status code: ${response.status}`);
      }
    }
    return Promise.reject(error);
  }
);