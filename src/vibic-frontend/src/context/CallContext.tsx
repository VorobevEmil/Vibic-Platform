import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import CallRequestType from '../types/CallRequestType';

interface CallContextType {
  isCallActive: boolean;
  activeCallRequest: CallRequestType | null;
  startDirectCall: (request: CallRequestType) => void;
  clearDirectCall: () => void;
  registerEndCall: (fn: (() => void) | null) => void;
  endCall: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCallContext = (): CallContextType => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCallContext must be used within a CallProvider');
  return context;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCallRequest, setActiveCallRequest] = useState<CallRequestType | null>(null);
  const activeCallRequestRef = useRef<CallRequestType | null>(null);
  const pendingCallRequestRef = useRef<CallRequestType | null>(null);
  const endCallRef = useRef<(() => void) | null>(null);

  const startDirectCall = useCallback((request: CallRequestType) => {
    const currentRequest = activeCallRequestRef.current;

    if (!currentRequest) {
      activeCallRequestRef.current = request;
      setActiveCallRequest(request);
      return;
    }

    const isSameCall =
      currentRequest.channelId === request.channelId
      && currentRequest.peerUserId === request.peerUserId;

    if (isSameCall) {
      const mergedRequest = { ...currentRequest, ...request };
      activeCallRequestRef.current = mergedRequest;
      setActiveCallRequest(mergedRequest);
      return;
    }

    pendingCallRequestRef.current = request;

    if (endCallRef.current) {
      endCallRef.current();
      return;
    }

    pendingCallRequestRef.current = null;
    activeCallRequestRef.current = request;
    setActiveCallRequest(request);
  }, []);

  const clearDirectCall = useCallback(() => {
    const nextRequest = pendingCallRequestRef.current;
    pendingCallRequestRef.current = null;
    endCallRef.current = null;
    activeCallRequestRef.current = nextRequest;
    setActiveCallRequest(nextRequest);
  }, []);

  const registerEndCall = useCallback((fn: (() => void) | null) => {
    endCallRef.current = fn;
  }, []);

  const endCall = useCallback(() => {
    pendingCallRequestRef.current = null;

    if (endCallRef.current) {
      endCallRef.current();
      return;
    }

    clearDirectCall();
  }, [clearDirectCall]);

  const value = useMemo<CallContextType>(() => ({
    isCallActive: activeCallRequest !== null,
    activeCallRequest,
    startDirectCall,
    clearDirectCall,
    registerEndCall,
    endCall,
  }), [activeCallRequest, clearDirectCall, endCall, registerEndCall, startDirectCall]);

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};
