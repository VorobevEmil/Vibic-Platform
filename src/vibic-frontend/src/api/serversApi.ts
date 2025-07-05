import {ServerFullResponse, ServerRequest, ServerSummaryResponse} from '../types/ServerType';
import { http } from './httpClient';

export const serversApi = {
  getServerById: (id: string) =>
    http.get<ServerFullResponse>(`/servers/${id}`),
  getMyServers: () =>
    http.get<ServerSummaryResponse[]>('/servers/mine'),
  createServer: (request: ServerRequest) =>
    http.post<ServerSummaryResponse>('/servers', request)
};