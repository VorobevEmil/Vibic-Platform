import { ChannelType } from "./enums/ChannelType";

export interface ServerRequest {
    name: string
}

export interface ServerSummaryResponse extends ServerRequest {
    id: string,
    iconUrl: string,
    channelId: string
}

export interface ServerFullResponse extends ServerRequest {
    id: string;
    iconUrl?: string | null;
    ownerId: string;
    channels: ServerChannelResponse[];
    members: ServerMemberResponse[];
}

export interface ServerChannelResponse {
    id: string;
    name: string;
    channelType: ChannelType;
    isPublic: boolean;
}

export interface ServerMemberResponse {
    userId: string;
    displayName: string;
    username: string;
    avatarUrl?: string | null;
}
