import { FriendRequestResponse } from '../types/FriendRequestType';
import UserProfileResponse from '../types/UserProfileType';
import { http } from './httpClient';

export const friendsApi = {
    sendFriendRequest: (receiverId: string) =>
        http.post(`/friends/request/${receiverId}`),
    acceptRequest: (requestId: string) =>
        http.post(`/friends/accept/${requestId}`),
    rejectRequest: (requestId: string) =>
        http.post(`/friends/reject/${requestId}`),
    getFriends: () =>
        http.get<UserProfileResponse[]>(`/friends`),
    removeFriend: (friendId: string) =>
        http.delete(`/friends/${friendId}`),
    getIncoming:() =>
        http.get<FriendRequestResponse[]>(`/friends/requests/incoming`),
    getOutgoing:() =>
        http.get<FriendRequestResponse[]>(`/friends/requests/outgoing`)
};