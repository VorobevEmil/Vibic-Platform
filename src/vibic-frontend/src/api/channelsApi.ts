import DirectChannelType from '../types/DirectChannelType';
import { http } from './httpClient';

export const channelsApi = {
  getDirectChannelById: (id: string) =>
    http.get<DirectChannelType>(`https://localhost:7138/channels/direct/${id}`),
  getDirectChannels: () =>
    http.get<DirectChannelType[]>('https://localhost:7138/channels/direct'),
  createDirectChannel: (userId: string) =>
    http.post<DirectChannelType | null>('https://localhost:7138/channels/direct', { userId })
};