import React, { createContext, useState, useContext } from 'react';

interface MediaContextType {
  isMicOn: boolean;
  isHeadphonesOn: boolean;
  setIsMicOn: React.Dispatch<React.SetStateAction<boolean>>;
  setIsHeadphonesOn: React.Dispatch<React.SetStateAction<boolean>>;
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


  return (
    <MediaContext.Provider value={{ isMicOn, isHeadphonesOn, setIsMicOn, setIsHeadphonesOn }}>
      {children}
    </MediaContext.Provider>
  );
};