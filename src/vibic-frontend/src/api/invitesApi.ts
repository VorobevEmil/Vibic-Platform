import { InviteResponse } from '../types/InviteType';
import { http } from './httpClient';

export const invitesApi = {
    getInvite: (inviteCode: string) =>
        http.get(`/invites/${inviteCode}`),
    joinServer: (inviteCode: string) =>
        http.post(`/invites/${inviteCode}`),
    createInvite: (serverId: string) =>
        http.post<InviteResponse>(`/servers/${serverId}/invites`)
};
