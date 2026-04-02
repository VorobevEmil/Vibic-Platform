import React, { createContext, useContext, useMemo, useState } from 'react';

export interface HeaderState {
  title: string;
  iconUrl?: string | null;
}

interface HeaderContextType {
  header: HeaderState | null;
  setHeader: (header: HeaderState | null) => void;
}

const HeaderContext = createContext<HeaderContextType | null>(null);

export const useHeaderContext = (): HeaderContextType => {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error('useHeaderContext must be used within a HeaderProvider');
  return ctx;
};

export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [header, setHeader] = useState<HeaderState | null>(null);

  const value = useMemo<HeaderContextType>(() => ({
    header,
    setHeader,
  }), [header]);

  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  );
};
