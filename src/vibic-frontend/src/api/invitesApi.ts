import { InviteResponse } from '../types/InviteType';
import { http } from './httpClient';

export const invitesApi = {
    getInvite: (inviteCode: string) =>
        http.get(`http://localhost:7138/invites/${inviteCode}`),
    joinServer: (inviteCode: string) =>
        http.post(`http://localhost:7138/invites/${inviteCode}`),
    createInvite: (serverId: string) =>
        http.post<InviteResponse>(`http://localhost:7138/servers/${serverId}/invites`)
}