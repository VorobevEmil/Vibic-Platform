import {ServerFullResponse, ServerRequest, ServerSummaryResponse} from '../types/ServerType';
import { http } from './httpClient';

export const serversApi = {
  getServerById: (id: string) =>
    http.get<ServerFullResponse>(`http://localhost:7138/servers/${id}`),
  getMyServers: () =>
    http.get<ServerSummaryResponse[]>('http://localhost:7138/servers/mine'),
  createServer: (request: ServerRequest) =>
    http.post<ServerSummaryResponse>('http://localhost:7138/servers', request)
};