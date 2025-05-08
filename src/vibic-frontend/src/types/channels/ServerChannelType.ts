import { ChannelType } from "../enums/ChannelType";

export interface ServerChannelRequest {
    name: string;
    channelType: ChannelType;
    isPublic: boolean
}