import { http } from './httpClient';

export const userProfilesApi = {
    search: (search: string) =>
      http.get(`https://localhost:7155/user-profiles/search?search=${search}`),

    me: () =>
      http.get('https://localhost:7155/user-profiles/me'),
    getById: (userId: string) =>
      http.get(`https://localhost:7155/user-profiles/${userId}`)
};