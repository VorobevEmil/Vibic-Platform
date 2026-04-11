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
  const endCallRef = useRef<(() => void) | null>(null);

  const startDirectCall = useCallback((request: CallRequestType) => {
    setActiveCallRequest((currentRequest) => {
      if (!currentRequest) {
        return request;
      }

      const isSameCall =
        currentRequest.channelId === request.channelId
        && currentRequest.peerUserId === request.peerUserId;

      return isSameCall ? { ...currentRequest, ...request } : currentRequest;
    });
  }, []);

  const clearDirectCall = useCallback(() => {
    setActiveCallRequest(null);
    endCallRef.current = null;
  }, []);

  const registerEndCall = useCallback((fn: (() => void) | null) => {
    endCallRef.current = fn;
  }, []);

  const endCall = useCallback(() => {
    endCallRef.current?.();
  }, []);

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
