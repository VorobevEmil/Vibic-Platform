import { channelsApi } from '../api/channelsApi';
import DirectChannelType from '../types/DirectChannelType';

export async function resolveOrCreateChannel(
  userId: string,
  channels: DirectChannelType[],
): Promise<DirectChannelType | null> {
  const response = await channelsApi.createDirectChannel(userId);

  if (response.status === 201 && response.data) {
    return response.data;
  }

  if (response.status === 204) {
    return channels.find((c) => c.channelMembers.find((cm) => cm.userId === userId) != null) || null;
  }

  return null;
}