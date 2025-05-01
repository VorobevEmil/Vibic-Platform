import DirectChannelResponse from '../types/DirectChannelType';
import { http } from './httpClient';

export const channelsApi = {
  getDirectChannelById: (id: string) =>
    http.get<DirectChannelResponse>(`http://localhost:7138/channels/direct/${id}`),
  getDirectChannels: () =>
    http.get<DirectChannelResponse[]>('http://localhost:7138/channels/direct'),
  createDirectChannel: (userId: string) =>
    http.post<DirectChannelResponse | null>('http://localhost:7138/channels/direct', { userId })
};