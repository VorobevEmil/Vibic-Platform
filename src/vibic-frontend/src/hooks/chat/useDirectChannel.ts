import { useEffect, useState } from 'react';
import { channelsApi } from '../../api/channelsApi';
import { userProfilesApi } from '../../api/userProfilesApi';
import UserProfileType from '../../types/UserProfileType';

export default function useDirectChannel(channelId: string, localUserId?: string) {
  const [peerUser, setPeerUser] = useState<UserProfileType | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!localUserId) return;

      const channelResponse = await channelsApi.getDirectChannelById(channelId);
      const loadedChannel = channelResponse.data;

      const otherUserId = loadedChannel.channelMembers.find(m => m.userId !== localUserId)?.userId;
      if (!otherUserId) return;

      const userResponse = await userProfilesApi.getById(otherUserId);
      setPeerUser(userResponse.data);
    };

    load();
  }, [channelId, localUserId]);

  return peerUser;
}