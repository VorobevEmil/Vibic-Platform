type CallRequestType = {
  peerUserId: string;
  peerUsername: string;
  peerAvatarUrl: string;
  initiatorUsername: string;   
  initiatorAvatarUrl: string;  
  channelId: string;          
  isInitiator?: boolean;
};

export default CallRequestType;