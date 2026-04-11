import { ChannelType } from "../enums/ChannelType";

export interface ServerChannelRequest {
    name: string;
    channelType: ChannelType;
    isPublic: boolean;
    memberIds?: string[];
}

export interface UpdateServerChannelRequest {
    name: string;
    isPublic: boolean;
    memberIds?: string[];
}

export interface ServerChannelParticipantResponse {
    userId: string;
    displayName: string;
    username: string;
    avatarUrl?: string | null;
}

export interface ServerChannelSettingsResponse {
    id: string;
    name: string;
    channelType: ChannelType;
    isPublic: boolean;
    memberIds: string[];
}
