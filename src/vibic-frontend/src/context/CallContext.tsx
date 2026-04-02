import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

interface CallContextType {
  isCallActive: boolean;
  setCallActive: (active: boolean) => void;
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
  const [isCallActive, setIsCallActive] = useState(false);
  const endCallRef = useRef<(() => void) | null>(null);

  const value = useMemo<CallContextType>(() => ({
    isCallActive,
    setCallActive: setIsCallActive,
    registerEndCall: (fn) => {
      endCallRef.current = fn;
    },
    endCall: () => {
      endCallRef.current?.();
    },
  }), [isCallActive]);

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};
