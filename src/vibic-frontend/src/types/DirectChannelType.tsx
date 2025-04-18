type ChannelMember = {
    userId: string;
    username: string;
    avatarUrl?: string | null;
};

type DirectChannelType = {
    id: string;
    channelMembers: ChannelMember[];
};

export default DirectChannelType;