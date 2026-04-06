import { ChannelType } from "../enums/ChannelType";

export interface ServerChannelRequest {
    name: string;
    channelType: ChannelType;
    isPublic: boolean
}

export interface ServerChannelParticipantResponse {
    userId: string;
    displayName: string;
    username: string;
    avatarUrl?: string | null;
}
