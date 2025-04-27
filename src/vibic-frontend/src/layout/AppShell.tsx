import ServerSidebar from '../components/Layout/ServerSidebar';
import RightSidebar from '../components/Layout/RightSidebar';
import { AuthProvider } from '../context/AuthContext';
import CallListener from '../components/Call/CallListener';
import { MediaProvider } from '../context/MediaContext';

interface AppShellProps {
  children: React.ReactNode;
}


export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen w-screen flex bg-gray-900 text-white overflow-hidden">
      <AuthProvider>
        <MediaProvider>
          <CallListener />
          <ServerSidebar />
          {children}
          <RightSidebar />
        </MediaProvider>
      </AuthProvider>
    </div>
  );
}
