import DirectChannelResponse from '../types/channels/DirectChannelType';
import { ServerChannelRequest } from '../types/channels/ServerChannelType';
import { http } from './httpClient';

export const channelsApi = {
  getDirectChannelById: (id: string) =>
    http.get<DirectChannelResponse>(`/channels/direct/${id}`),
  getDirectChannels: () =>
    http.get<DirectChannelResponse[]>('/channels/direct'),
  createDirectChannel: (userId: string) =>
    http.post<DirectChannelResponse | null>('/channels/direct', { userId }),
  createServerChannel: (serverId: string, request: ServerChannelRequest) =>
    http.post(`/servers/${serverId}/channels`, request)
};