import { http } from './httpClient';

export const channelsApi = {
    me: () =>
      http.get('https://localhost:7138/channels/me'),
};