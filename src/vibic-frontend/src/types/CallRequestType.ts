type CallRequestType = {
  peerUserId: string;
  peerUsername: string;
  peerAvatarUrl: string;
  initiatorUsername: string;
  initiatorAvatarUrl: string;
  channelId: string;
  isCamOn?: boolean;
  isInitiator?: boolean;
};

export default CallRequestType;