import { useEffect, useState } from 'react';
import { channelsApi } from '../api/channelsApi';
import { userProfilesApi } from '../api/userProfilesApi';
import DirectChannelType from '../types/DirectChannelType';
import UserProfileType from '../types/UserProfileType';

export default function useDirectChannel(channelId: string, currentUserId?: string) {
  const [channel, setChannel] = useState<DirectChannelType | null>(null);
  const [memberUser, setMemberUser] = useState<UserProfileType | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentUserId) return;

      const channelResponse = await channelsApi.getDirectChannelById(channelId);
      const loadedChannel = channelResponse.data;
      setChannel(loadedChannel);

      const otherUserId = loadedChannel.channelMembers.find(m => m.userId !== currentUserId)?.userId;
      if (!otherUserId) return;

      const userResponse = await userProfilesApi.getById(otherUserId);
      setMemberUser(userResponse.data);
    };

    load();
  }, [channelId, currentUserId]);

  return { channel, memberUser };
}