type ChannelMember = {
    userId: string;
    displayName: string;
    avatarUrl: string;
};

interface DirectChannelResponse {
    id: string;
    channelMembers: ChannelMember[];
};

export default DirectChannelResponse;