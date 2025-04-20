type ChannelMember = {
    userId: string;
    username: string;
    avatarUrl: string;
};

type DirectChannelType = {
    id: string;
    channelMembers: ChannelMember[];
};

export default DirectChannelType;