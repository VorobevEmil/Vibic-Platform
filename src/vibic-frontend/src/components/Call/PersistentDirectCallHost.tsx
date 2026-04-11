import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useCallContext } from '../../context/CallContext';
import CallPanel from './CallPanel';
import useCallConnection from '../../hooks/call/useCallConnection';
import { getDirectCallSlotId } from './directCallSlot';

const DEFAULT_CALL_PANEL_HEIGHT = 360;
const MIN_CALL_PANEL_HEIGHT = 220;
const MIN_BOTTOM_CONTENT_SPACE = 220;
const CALL_PANEL_STORAGE_KEY = 'vibic.direct-call-panel-height';

export default function PersistentDirectCallHost() {
  const { activeCallRequest, clearDirectCall, registerEndCall } = useCallContext();
  const location = useLocation();

  if (!activeCallRequest) {
    return null;
  }

  return (
    <ActiveDirectCallSession
      callRequest={activeCallRequest}
      onClose={clearDirectCall}
      registerEndCall={registerEndCall}
      routeKey={location.pathname}
    />
  );
}

function ActiveDirectCallSession({
  callRequest,
  onClose,
  registerEndCall,
  routeKey,
}: {
  callRequest: import('../../types/CallRequestType').default;
  onClose: () => void;
  registerEndCall: (fn: (() => void) | null) => void;
  routeKey: string;
}) {
  const [callPanelHeight, setCallPanelHeight] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_CALL_PANEL_HEIGHT;
    }

    const storedValue = window.localStorage.getItem(CALL_PANEL_STORAGE_KEY);
    const parsedValue = storedValue ? Number.parseInt(storedValue, 10) : NaN;

    return Number.isFinite(parsedValue) ? parsedValue : DEFAULT_CALL_PANEL_HEIGHT;
  });
  const [isResizing, setIsResizing] = useState(false);
  const lastPointerYRef = useRef<number | null>(null);
  const {
    localVideoRef,
    remoteVideoRef,
    isCamOn,
    isMicOn,
    isRemoteCamOn,
    isRemoteMicOn,
    remoteStreamStarted,
    toggleCam,
    closeCall,
  } = useCallConnection({
    callRequest,
    onClose,
  });

  const clampCallPanelHeight = useCallback((height: number) => {
    if (typeof window === 'undefined') {
      return Math.max(MIN_CALL_PANEL_HEIGHT, height);
    }

    const maxHeight = Math.max(
      MIN_CALL_PANEL_HEIGHT,
      window.innerHeight - MIN_BOTTOM_CONTENT_SPACE - 180,
    );

    return Math.min(Math.max(height, MIN_CALL_PANEL_HEIGHT), maxHeight);
  }, []);

  const handleResizeStart = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    lastPointerYRef.current = event.clientY;
    setIsResizing(true);
  }, []);

  const handleResizeReset = useCallback(() => {
    setCallPanelHeight(clampCallPanelHeight(DEFAULT_CALL_PANEL_HEIGHT));
  }, [clampCallPanelHeight]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(CALL_PANEL_STORAGE_KEY, String(clampCallPanelHeight(callPanelHeight)));
  }, [callPanelHeight, clampCallPanelHeight]);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (lastPointerYRef.current === null) {
        lastPointerYRef.current = event.clientY;
        return;
      }

      const deltaY = event.clientY - lastPointerYRef.current;
      lastPointerYRef.current = event.clientY;
      setCallPanelHeight((previousHeight) => clampCallPanelHeight(previousHeight + deltaY));
    };

    const stopResizing = () => {
      lastPointerYRef.current = null;
      setIsResizing(false);
    };

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopResizing);
    window.addEventListener('pointercancel', stopResizing);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopResizing);
      window.removeEventListener('pointercancel', stopResizing);
    };
  }, [clampCallPanelHeight, isResizing]);

  useEffect(() => {
    const handleWindowResize = () => {
      setCallPanelHeight((previousHeight) => clampCallPanelHeight(previousHeight));
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [clampCallPanelHeight]);

  useEffect(() => {
    registerEndCall(() => closeCall(true));
    return () => registerEndCall(null);
  }, [closeCall, registerEndCall]);

  const portalTarget = typeof document === 'undefined'
    ? null
    : document.getElementById(getDirectCallSlotId(callRequest.channelId));

  const panelContent = (
    <div className="shrink-0 border-b border-[#1e1f22] bg-[#1e1f22]">
      <CallPanel
        callRequest={callRequest}
        height={clampCallPanelHeight(callPanelHeight)}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        isCamOn={isCamOn}
        isMicOn={isMicOn}
        isRemoteCamOn={isRemoteCamOn}
        isRemoteMicOn={isRemoteMicOn}
        remoteStreamStarted={remoteStreamStarted}
        toggleCam={toggleCam}
        closeCall={closeCall}
      />

      <div className="px-4 pb-2">
        <button
          type="button"
          onPointerDown={handleResizeStart}
          onDoubleClick={handleResizeReset}
          className="group flex w-full touch-none cursor-row-resize items-center justify-center py-2"
          aria-label="Изменить размер панели звонка"
        >
          <span
            className={`h-1.5 w-24 rounded-full transition ${
              isResizing
                ? 'bg-sky-400 shadow-[0_0_0_6px_rgba(56,189,248,0.08)]'
                : 'bg-white/10 group-hover:bg-white/20'
            }`}
          />
        </button>
      </div>
    </div>
  );

  void routeKey;

  return portalTarget ? createPortal(panelContent, portalTarget) : null;
}
