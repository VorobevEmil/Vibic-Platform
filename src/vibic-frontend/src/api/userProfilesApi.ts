import { AvatarResponse } from '../types/AvatarType';
import UserProfileResponse from '../types/UserProfileType';
import { http } from './httpClient';

export const userProfilesApi = {
  search: (search: string) =>
    http.get<UserProfileResponse[]>(`http://localhost:7155/user-profiles/search?search=${search}`),
  me: () =>
    http.get<UserProfileResponse>('http://localhost:7155/user-profiles/me'),
  getById: (userId: string) =>
    http.get<UserProfileResponse>(`http://localhost:7155/user-profiles/${userId}`),
  updateAvatar: (file: File | null) => {
    const formData = new FormData();

    if (file !== null)
      formData.append('file', file);

    return http.patch<AvatarResponse>('http://localhost:7155/user-profiles/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};