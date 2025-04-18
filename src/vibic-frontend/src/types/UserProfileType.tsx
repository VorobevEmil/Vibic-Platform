type UserProfileType = {
    id: string;
    username: string;
    avatarUrl?: string | null;
    bio?: string | null;
    userStatus: number
};

export default UserProfileType;