import ServerSidebar from '../components/ServerSidebar';
import DirectChannelListSidebar from '../components/DirrectChannelListSidebar';
import FriendCenterPanel from '../components/FriendCenterPanel';
import RightSidebar from '../components/RightSidebar';
import DirectChatCenterPanel from '../components/DirectChatCenterPanel';
import { AuthProvider } from '../context/AuthContext';
import CallListener from '../components/Call/CallListener';

interface AppShellProps {
  id?: string;
}


export default function AppShell({ id }: AppShellProps) {
  return (
    <div className="h-screen w-screen flex bg-gray-900 text-white overflow-hidden">
      <AuthProvider>
        <CallListener />
        <ServerSidebar />
        <DirectChannelListSidebar />
        {id ? <DirectChatCenterPanel channelId={id} /> : <FriendCenterPanel />}
        <RightSidebar />
      </AuthProvider>
    </div>
  );
}
