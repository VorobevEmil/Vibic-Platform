import ServerSidebar from '../components/Layout/ServerSidebar';
import RightSidebar from '../components/Layout/RightSidebar';
import CallListener from '../components/Call/CallListener';
import PersistentDirectCallHost from '../components/Call/PersistentDirectCallHost';
import { MediaProvider } from '../context/MediaContext';
import FooterProfilePanel from '../components/Layout/FooterProfilePanel';
import VoiceProvider from '../components/Server/VoiceProvider';
import { CallProvider } from '../context/CallContext';
import { useHeaderContext } from '../context/HeaderContext';
import { resolveAssetUrl } from '../api/httpClient';

interface AppShellProps {
  children: React.ReactNode;
}


function HeaderBar() {
  const { header } = useHeaderContext();

  if (!header) {
    return <div className="h-8" />;
  }

  return (
    <div className="h-8 flex items-center gap-2 px-3">
      {header.iconUrl && (
        <img
          src={resolveAssetUrl(header.iconUrl)}
          alt={header.title}
          className="w-5 h-5 rounded-md object-cover"
        />
      )}
      <div className="text-sm font-semibold text-white truncate">{header.title}</div>
    </div>
  );
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="bg-[#1e1f22] text-white h-screen overflow-hidden flex flex-col">
      <HeaderBar />

      <div className="flex flex-1 overflow-hidden">
        <MediaProvider>
          <CallProvider>
            <VoiceProvider>
              <CallListener />
              <PersistentDirectCallHost />
              <ServerSidebar />
              {children}
              <RightSidebar />
              <FooterProfilePanel />
            </VoiceProvider>
          </CallProvider>
        </MediaProvider>
      </div>
    </div>
  );
}
