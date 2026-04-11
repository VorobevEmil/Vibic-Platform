import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const RIGHT_SIDEBAR_VISIBILITY_STORAGE_KEY = 'vibic.right-sidebar-visible';

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
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    const storedValue = window.localStorage.getItem(RIGHT_SIDEBAR_VISIBILITY_STORAGE_KEY);

    if (storedValue === null) {
      return true;
    }

    return storedValue === 'true';
  });

  const setSidebar = useCallback((next: ReactNode | null) => {
    setSidebarState(next);
  }, []);

  const toggleVisibility = useCallback(() => {
    setIsVisible((v) => !v);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(RIGHT_SIDEBAR_VISIBILITY_STORAGE_KEY, String(isVisible));
  }, [isVisible]);

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
