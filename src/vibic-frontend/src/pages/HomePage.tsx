import DirectChannelListSidebar from '../components/Chat/DirectChat/DirrectChannelListSidebar';
import FriendCenterPanel from '../components/Chat/FriendChat/FriendCenterPanel';
import AppShell from '../layout/AppShell';

export default function HomePage() {
  return (
    <AppShell>
      <DirectChannelListSidebar />
      <FriendCenterPanel />
    </AppShell>
  )
}
