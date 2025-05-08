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
    channels: ServerChannelResponse[];
}

export interface ServerChannelResponse {
    id: string;
    name: string;
    channelType: ChannelType;
    isPublic: boolean;
}