import { useParams } from 'react-router-dom';
import AppShell from '../layout/AppShell';
import DirectChatCenterPanel from '../components/Chat/DirectChat/DirectChatCenterPanel';
import DirectChannelListSidebar from '../components/Chat/DirectChat/DirrectChannelListSidebar';

export default function ChannelPage() {
  const { id } = useParams();

  return (
    <AppShell>
      <DirectChannelListSidebar />
      <DirectChatCenterPanel channelId={id!} />
    </AppShell>
  )
}