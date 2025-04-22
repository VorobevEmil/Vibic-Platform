import React, { createContext, useState, useCallback, useContext } from 'react';

interface MediaContextType {
  isMicOn: boolean;
  isHeadphonesOn: boolean;
  toggleMic: () => void;
  toggleHeadphones: () => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export const useMedia = (): MediaContextType => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isHeadphonesOn, setIsHeadphonesOn] = useState(true);

  const toggleMic = useCallback(() => setIsMicOn((prev) => !prev), []);
  const toggleHeadphones = useCallback(() => setIsHeadphonesOn((prev) => !prev), []);

  return (
    <MediaContext.Provider value={{ isMicOn, isHeadphonesOn, toggleMic, toggleHeadphones }}>
      {children}
    </MediaContext.Provider>
  );
};