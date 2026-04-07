import React, { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

interface RightSidebarContextType {
  sidebar: ReactNode | null;
  setSidebar: (sidebar: ReactNode | null) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
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
  const [sidebar, setSidebarState] = useState<ReactNode | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const setSidebar = useCallback((next: ReactNode | null) => {
    setSidebarState(next);
    if (next !== null) {
      setIsVisible(true);
    }
  }, []);

  const toggleVisibility = useCallback(() => {
    setIsVisible((v) => !v);
  }, []);

  const value = useMemo<RightSidebarContextType>(() => ({
    sidebar,
    setSidebar,
    isVisible,
    toggleVisibility,
  }), [sidebar, setSidebar, isVisible, toggleVisibility]);

  return (
    <RightSidebarContext.Provider value={value}>
      {children}
    </RightSidebarContext.Provider>
  );
};
