import DirectChannelResponse from '../types/channels/DirectChannelType';
import LinkPreviewResponse from '../types/LinkPreviewType';
import {
  ServerChannelParticipantResponse,
  ServerChannelRequest,
  ServerChannelSettingsResponse,
  UpdateServerChannelRequest,
} from '../types/channels/ServerChannelType';
import { ServerChannelResponse } from '../types/ServerType';
import { http } from './httpClient';

export const channelsApi = {
  getDirectChannelById: (id: string) =>
    http.get<DirectChannelResponse>(`/channels/direct/${id}`),
  getDirectChannels: () =>
    http.get<DirectChannelResponse[]>('/channels/direct'),
  createDirectChannel: (userId: string) =>
    http.post<DirectChannelResponse | null>('/channels/direct', { userId }),
  getLinkPreview: (url: string) =>
    http.get<LinkPreviewResponse>('/channels/link-preview', { params: { url } }),
  getServerChannelMembers: (serverId: string, channelId: string) =>
    http.get<ServerChannelParticipantResponse[]>(`/servers/${serverId}/channels/${channelId}/members`),
  getServerChannelSettings: (serverId: string, channelId: string) =>
    http.get<ServerChannelSettingsResponse>(`/servers/${serverId}/channels/${channelId}/settings`),
  createServerChannel: (serverId: string, request: ServerChannelRequest) =>
    http.post<ServerChannelResponse>(`/servers/${serverId}/channels`, request),
  updateServerChannel: (serverId: string, channelId: string, request: UpdateServerChannelRequest) =>
    http.put<ServerChannelResponse>(`/servers/${serverId}/channels/${channelId}`, request),
  deleteServerChannel: (serverId: string, channelId: string) =>
    http.delete(`/servers/${serverId}/channels/${channelId}`),

  closeDirectChannel: (channelId: string) =>
    http.delete(`/channels/direct/${channelId}`),
};
