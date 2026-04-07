import DirectChannelResponse from '../types/channels/DirectChannelType';
import {
  ServerChannelParticipantResponse,
  ServerChannelRequest,
} from '../types/channels/ServerChannelType';
import { http } from './httpClient';

export const channelsApi = {
  getDirectChannelById: (id: string) =>
    http.get<DirectChannelResponse>(`/channels/direct/${id}`),
  getDirectChannels: () =>
    http.get<DirectChannelResponse[]>('/channels/direct'),
  createDirectChannel: (userId: string) =>
    http.post<DirectChannelResponse | null>('/channels/direct', { userId }),
  getServerChannelMembers: (serverId: string, channelId: string) =>
    http.get<ServerChannelParticipantResponse[]>(`/servers/${serverId}/channels/${channelId}/members`),
  createServerChannel: (serverId: string, request: ServerChannelRequest) =>
    http.post(`/servers/${serverId}/channels`, request),

  closeDirectChannel: (channelId: string) =>
    http.delete(`/channels/direct/${channelId}`),
};
