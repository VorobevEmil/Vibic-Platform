import UserProfileResponse from "./UserProfileType";

export interface FriendRequestResponse  {
    requestId: string;
    userProfile: UserProfileResponse;
}