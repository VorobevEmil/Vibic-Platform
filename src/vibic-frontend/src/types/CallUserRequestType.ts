type CallRequestType = {
  targetUserId: string;
  fromUsername: string;
  fromAvatarUrl: string;
  channelId: string;
  isInitiator?: boolean;
};

export default CallRequestType;