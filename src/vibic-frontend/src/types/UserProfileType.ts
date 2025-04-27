interface UserProfileResponse {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string;
    bio?: string | null;
    userStatus: number
};

export default UserProfileResponse;