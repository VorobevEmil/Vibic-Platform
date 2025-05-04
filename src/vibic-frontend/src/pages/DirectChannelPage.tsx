import { useParams } from 'react-router-dom';
import AppShell from '../layout/AppShell';
import ChatCenterPanel from '../components/Chat/ChatCenterPanel';
import DirectChannelListSidebar from '../components/Chat/DirectChat/DirrectChannelListSidebar';
import CallHeaderHandler from '../components/Call/CallHeaderHandler';
import { ChannelType } from '../types/enums/ChannelType';

export default function ChannelPage() {
  const { id } = useParams();

  return (
    <AppShell>
      <DirectChannelListSidebar />
      <ChatCenterPanel channelType={ChannelType.Direct} channelId={id!}>
        <CallHeaderHandler channelId={id!} />
      </ChatCenterPanel>
    </AppShell>
  )
}