type MessageType = {
    id: string;
    channelId: string;
    content: string;
    senderId: string;
    senderUsername: string;
    senderAvatarUrl: string;
    sentAt: Date
}

export default MessageType;
