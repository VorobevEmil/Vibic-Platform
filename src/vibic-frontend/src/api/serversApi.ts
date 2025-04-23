import {ServerRequest, ServerResponse} from '../types/ServerType';
import { http } from './httpClient';

export const serversApi = {
  getMyServers: () =>
    http.get<ServerResponse[]>('https://localhost:7138/servers/mine'),
  createServer: (request: ServerRequest) =>
    http.post<ServerResponse>('https://localhost:7138/servers', request)
};