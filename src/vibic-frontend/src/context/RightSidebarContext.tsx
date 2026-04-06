import React, { ReactNode, createContext, useContext, useMemo, useState } from 'react';

interface RightSidebarContextType {
  sidebar: ReactNode | null;
  setSidebar: (sidebar: ReactNode | null) => void;
}

const RightSidebarContext = createContext<RightSidebarContextType | null>(null);

export const useRightSidebarContext = (): RightSidebarContextType => {
  const context = useContext(RightSidebarContext);

  if (!context) {
    throw new Error('useRightSidebarContext must be used within a RightSidebarProvider');
  }

  return context;
};

export const RightSidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebar, setSidebar] = useState<ReactNode | null>(null);

  const value = useMemo<RightSidebarContextType>(() => ({
    sidebar,
    setSidebar,
  }), [sidebar]);

  return (
    <RightSidebarContext.Provider value={value}>
      {children}
    </RightSidebarContext.Provider>
  );
};
