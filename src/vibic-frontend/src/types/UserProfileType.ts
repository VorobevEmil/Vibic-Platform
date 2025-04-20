type UserProfileType = {
    id: string;
    username: string;
    avatarUrl: string;
    bio?: string | null;
    userStatus: number
};

export default UserProfileType;