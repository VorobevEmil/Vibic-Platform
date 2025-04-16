import ServerSidebar from '../components/ServerSidebar';
import DMListSidebar from '../components/DMListSidebar';
import FriendCenterPanel from '../components/FriendCenterPanel';
import RightSidebar from '../components/RightSidebar';

export default function AppShell() {
  return (
    <div className="h-screen w-screen flex bg-gray-900 text-white overflow-hidden">
      <ServerSidebar />
      <DMListSidebar />
      <FriendCenterPanel />
      <RightSidebar />
    </div>
  );
}
