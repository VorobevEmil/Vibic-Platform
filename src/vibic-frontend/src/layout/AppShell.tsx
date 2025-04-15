import ServerSidebar from '../components/ServerSidebar';
import MainSidebar from '../components/MainSidebar';
import ChatArea from '../components/ChatArea';
import RightSidebar from '../components/RightSidebar';

export default function AppShell() {
  return (
    <div className="h-screen w-screen flex bg-gray-900 text-white overflow-hidden">
      <ServerSidebar />
      <MainSidebar />
      <ChatArea />
      <RightSidebar />
    </div>
  );
}
