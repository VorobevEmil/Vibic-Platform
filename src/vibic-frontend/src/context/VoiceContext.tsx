import { createContext, useContext } from 'react';

export interface VoiceContextType {
    joinChannel: (channelId: string) => void;
    leaveChannel: () => void;
    voiceUsers: { userId: string; displayName: string }[];
    currentChannelId: string | null;
}

export const VoiceContext = createContext<VoiceContextType | null>(null);

export const useVoice = () => {
    const context = useContext(VoiceContext);
    if (!context) throw new Error('useVoice must be used within VoiceProvider');
    return context;
};
