import { FriendRequestResponse } from '../types/FriendRequestType';
import UserProfileResponse from '../types/UserProfileType';
import { http } from './httpClient';

export const friendsApi = {
    sendFriendRequest: (receiverId: string) =>
        http.post(`http://localhost:7155/friends/request/${receiverId}`),
    acceptRequest: (requestId: string) =>
        http.post(`http://localhost:7155/friends/accept/${requestId}`),
    rejectRequest: (requestId: string) =>
        http.post(`http://localhost:7155/friends/reject/${requestId}`),
    getFriends: () =>
        http.get<UserProfileResponse[]>(`http://localhost:7155/friends`),
    removeFriend: (friendId: string) =>
        http.delete(`http://localhost:7155/friends/${friendId}`),
    getIncoming:() =>
        http.get<FriendRequestResponse[]>(`http://localhost:7155/friends/requests/incoming`),
    getOutgoing:() =>
        http.get<FriendRequestResponse[]>(`http://localhost:7155/friends/requests/outgoing`)
};