interface MessageResponse {
    id: string;
    channelId: string;
    content: string;
    senderId: string;
    senderUsername: string;
    senderAvatarUrl: string;
    sentAt: Date;
    isEdited?: boolean;
}

export default MessageResponse;