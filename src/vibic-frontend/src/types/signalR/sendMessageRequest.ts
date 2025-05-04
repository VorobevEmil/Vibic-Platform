import { ChannelType } from "../enums/ChannelType";

export default interface SendMessageRequest {
    channelType: ChannelType;
    channelId: string;
    serverId?: string;
    content: string;
}