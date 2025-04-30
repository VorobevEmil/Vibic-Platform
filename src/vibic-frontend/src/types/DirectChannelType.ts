type ChannelMember = {
    userId: string;
    displayName: string;
    avatarUrl: string;
};

type DirectChannelType = {
    id: string;
    channelMembers: ChannelMember[];
};

export default DirectChannelType;