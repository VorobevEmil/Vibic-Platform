import { useEffect, useState } from 'react';
import { channelsApi } from '../../api/channelsApi';
import { userProfilesApi } from '../../api/userProfilesApi';
import UserProfileType from '../../types/UserProfileType';

interface Props {
  serverId?: string,
  channelId: string,
  localUserId?: string
}

export default function useDirectChannel({ serverId, channelId, localUserId }: Props) {
  const [peerUser, setPeerUser] = useState<UserProfileType | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!localUserId || serverId) return;

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