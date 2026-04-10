import { ServerFullResponse, ServerSummaryResponse } from '../types/ServerType';
import { http } from './httpClient';

export const serversApi = {
  getServerById: (id: string) =>
    http.get<ServerFullResponse>(`/servers/${id}`),
  getMyServers: () =>
    http.get<ServerSummaryResponse[]>('/servers/mine'),
  createServer: (name: string, iconFile: File | null) => {
    const formData = new FormData();
    formData.append('name', name);
    if (iconFile) formData.append('icon', iconFile);

    return http.post<ServerSummaryResponse>('/servers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateServer: (id: string, name?: string, iconFile?: File | null) => {
    const formData = new FormData();
    if (name) formData.append('name', name);
    if (iconFile) formData.append('icon', iconFile);

    return http.put<ServerSummaryResponse>(`/servers/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteServer: (id: string) =>
    http.delete(`/servers/${id}`),
};
