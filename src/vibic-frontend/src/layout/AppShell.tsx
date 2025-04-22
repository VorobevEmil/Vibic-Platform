import ServerSidebar from '../components/Layout/ServerSidebar';
import DirectChannelListSidebar from '../components/Chat/DirectChat/DirrectChannelListSidebar';
import FriendCenterPanel from '../components/Chat/FriendChat/FriendCenterPanel';
import RightSidebar from '../components/Layout/RightSidebar';
import DirectChatCenterPanel from '../components/Chat/DirectChat/DirectChatCenterPanel';
import { AuthProvider } from '../context/AuthContext';
import CallListener from '../components/Call/CallListener';
import { MediaProvider } from '../context/MediaContext';

interface AppShellProps {
  id?: string;
}


export default function AppShell({ id }: AppShellProps) {
  return (
    <div className="h-screen w-screen flex bg-gray-900 text-white overflow-hidden">
      <AuthProvider>
        <MediaProvider>
          <CallListener />
          <ServerSidebar />
          <DirectChannelListSidebar />
          {id ? <DirectChatCenterPanel channelId={id} /> : <FriendCenterPanel />}
          <RightSidebar />
        </MediaProvider>
      </AuthProvider>
    </div>
  );
}
