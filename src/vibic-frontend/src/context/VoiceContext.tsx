import { createContext, useContext } from 'react';

export interface VoiceUser {
    userId: string;
    displayName: string;
    avatarUrl?: string | null;
    isMicOn: boolean;
}

export interface VoiceContextType {
    joinChannel: (channelId: string, serverId: string) => void;
    joinServer: (serverId: string, voiceChannelIds: string[]) => void;
    leaveServer: (serverId: string) => void;
    leaveChannel: () => void;
    voiceUsers: VoiceUser[];
    voiceUsersByChannel: Record<string, VoiceUser[]>;
    currentChannelId: string | null;
}

export const VoiceContext = createContext<VoiceContextType | null>(null);

export const useVoice = () => {
    const context = useContext(VoiceContext);
    if (!context) throw new Error('useVoice must be used within VoiceProvider');
    return context;
};
