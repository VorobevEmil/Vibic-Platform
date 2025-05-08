import DirectChannelResponse from '../types/channels/DirectChannelType';
import { ServerChannelRequest } from '../types/channels/ServerChannelType';
import { http } from './httpClient';

export const channelsApi = {
  getDirectChannelById: (id: string) =>
    http.get<DirectChannelResponse>(`http://localhost:7138/channels/direct/${id}`),
  getDirectChannels: () =>
    http.get<DirectChannelResponse[]>('http://localhost:7138/channels/direct'),
  createDirectChannel: (userId: string) =>
    http.post<DirectChannelResponse | null>('http://localhost:7138/channels/direct', { userId }),
  createServerChannel: (serverId: string, request: ServerChannelRequest) =>
    http.post(`http://localhost:7138/servers/${serverId}/channels`, request)
};