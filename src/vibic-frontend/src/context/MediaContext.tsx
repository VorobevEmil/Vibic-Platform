import React, { createContext, useState, useContext, useRef } from 'react';

interface MediaContextType {
  isMicOn: boolean;
  isHeadphonesOn: boolean;
  setIsMicOn: React.Dispatch<React.SetStateAction<boolean>>;
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
  const micBeforeDeafenRef = useRef(true);

  const toggleHeadphones = () => {
    if (isHeadphonesOn) {
      micBeforeDeafenRef.current = isMicOn;
      setIsMicOn(false);
      setIsHeadphonesOn(false);
    } else {
      setIsHeadphonesOn(true);
      setIsMicOn(micBeforeDeafenRef.current);
    }
  };

  return (
    <MediaContext.Provider value={{ isMicOn, isHeadphonesOn, setIsMicOn, toggleHeadphones }}>
      {children}
    </MediaContext.Provider>
  );
};