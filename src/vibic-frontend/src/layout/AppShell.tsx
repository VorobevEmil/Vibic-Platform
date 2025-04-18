import ServerSidebar from '../components/ServerSidebar';
import DMListSidebar from '../components/DMListSidebar';
import FriendCenterPanel from '../components/FriendCenterPanel';
import RightSidebar from '../components/RightSidebar';
import DirectChatCenterPanel from '../components/DirectChatCenterPanel';
import { AuthProvider } from '../context/AuthContext';

interface AppShellProps {
  id?: string;
}


export default function AppShell({ id }: AppShellProps) {
  return (
    <div className="h-screen w-screen flex bg-gray-900 text-white overflow-hidden">
      <AuthProvider>
        <ServerSidebar />
        <DMListSidebar />
        {id ? <DirectChatCenterPanel channelId={id} /> : <FriendCenterPanel />}
        <RightSidebar />
      </AuthProvider>
    </div>
  );
}
