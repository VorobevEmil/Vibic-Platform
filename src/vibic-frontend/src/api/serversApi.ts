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
  }
};
