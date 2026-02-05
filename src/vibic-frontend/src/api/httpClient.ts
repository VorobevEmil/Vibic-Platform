import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7157';

export const http = axios.create({
  baseURL,
  withCredentials: false,
});

const frontBaseUrl = import.meta.env.VITE_FRONT_BASE_URL || window.location.origin;

export const resolveAssetUrl = (value?: string | null): string | undefined => {
  if (!value) return value ?? undefined;

  // Absolute URLs (http/https/data) pass through unchanged.
  if (/^(https?:|data:)/i.test(value)) return value;

  // Default avatars are served by the frontend.
  if (value.startsWith('/default/')) return `${frontBaseUrl}${value}`;

  // Other relative paths should go через API.
  return `${baseURL}${value}`;
};

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
          if (!window.location.pathname.startsWith('/sign-in')
              && !window.location.pathname.startsWith('/sign-up')) {
            localStorage.removeItem('access_token');
            window.location.href = '/sign-in';
          }
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
