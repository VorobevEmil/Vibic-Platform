import { channelsApi } from '../api/channelsApi';
import DirectChannelResponse from '../types/channels/DirectChannelType';

export async function resolveOrCreateChannel(
  userId: string,
  channels: DirectChannelResponse[],
): Promise<DirectChannelResponse | null> {
  const response = await channelsApi.createDirectChannel(userId);

  if (response.status === 201 && response.data) {
    return response.data;
  }

  if (response.status === 204) {
    return channels.find((c) => c.channelMembers.find((cm) => cm.userId === userId) != null) || null;
  }

  return null;
}