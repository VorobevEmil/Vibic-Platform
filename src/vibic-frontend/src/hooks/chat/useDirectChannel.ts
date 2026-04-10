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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!localUserId || serverId) {
        setPeerUser(null);
        setIsLoading(false);
        return;
      }

      setPeerUser(null);
      setIsLoading(true);

      try {
        const channelResponse = await channelsApi.getDirectChannelById(channelId);
        const loadedChannel = channelResponse.data;

        const otherUserId = loadedChannel.channelMembers.find(m => m.userId !== localUserId)?.userId;
        if (!otherUserId) {
          setPeerUser(null);
          return;
        }

        const userResponse = await userProfilesApi.getById(otherUserId);
        setPeerUser(userResponse.data);
      } catch (error) {
        console.error('Не удалось загрузить данные собеседника', error);
        setPeerUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [channelId, localUserId, serverId]);

  return {
    peerUser,
    isLoading,
  };
}
