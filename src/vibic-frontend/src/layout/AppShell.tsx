import ServerSidebar from '../components/Layout/ServerSidebar';
import RightSidebar from '../components/Layout/RightSidebar';
import { AuthProvider } from '../context/AuthContext';
import CallListener from '../components/Call/CallListener';
import { MediaProvider } from '../context/MediaContext';
import FooterProfilePanel from '../components/Layout/FooterProfilePanel';
import VoiceProvider from '../components/Server/VoiceProvider';

interface AppShellProps {
  children: React.ReactNode;
}


export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="bg-[#1e1f22] text-white h-screen overflow-hidden flex flex-col">
      <div className="h-8 flex justify-center items-center">
        <div className="inline-flex items-center justify-center gap-2">
          <div>Header</div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <AuthProvider>
          <MediaProvider>
            <VoiceProvider>


              <CallListener />
              <ServerSidebar />

              {children}

              <RightSidebar />
              <FooterProfilePanel />
            </VoiceProvider>
          </MediaProvider>
        </AuthProvider>
      </div>
    </div>
  );
}
