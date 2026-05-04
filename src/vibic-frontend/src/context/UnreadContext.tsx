import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { chatMessageBus } from '../services/chatMessageBus';
import MessageResponse from '../types/MessageType';

interface UnreadContextType {
    unreadCounts: Record<string, number>;
    mutedChannels: Set<string>;
    markRead: (channelId: string) => void;
    toggleMute: (channelId: string) => void;
    isMuted: (channelId: string) => boolean;
}

const UnreadContext = createContext<UnreadContextType | null>(null);

export function useUnreadContext() {
    const ctx = useContext(UnreadContext);
    if (!ctx) throw new Error('useUnreadContext must be used within UnreadProvider');
    return ctx;
}

const MUTED_KEY = 'vibic:muted-channels';

function loadMuted(): Set<string> {
    try {
        const raw = localStorage.getItem(MUTED_KEY);
        return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
        return new Set();
    }
}

function saveMuted(muted: Set<string>) {
    localStorage.setItem(MUTED_KEY, JSON.stringify([...muted]));
}

export function UnreadProvider({ children }: { children: React.ReactNode }) {
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [mutedChannels, setMutedChannels] = useState<Set<string>>(loadMuted);
    const activeChannelRef = useRef<string | null>(null);
    const mutedRef = useRef(mutedChannels);
    mutedRef.current = mutedChannels;

    const markRead = useCallback((channelId: string) => {
        activeChannelRef.current = channelId;
        setUnreadCounts(prev => {
            if (!prev[channelId]) return prev;
            const next = { ...prev };
            delete next[channelId];
            return next;
        });
    }, []);

    const toggleMute = useCallback((channelId: string) => {
        setMutedChannels(prev => {
            const next = new Set(prev);
            if (next.has(channelId)) {
                next.delete(channelId);
            } else {
                next.add(channelId);
                // Clear any existing unread for muted channel
                setUnreadCounts(c => {
                    if (!c[channelId]) return c;
                    const n = { ...c };
                    delete n[channelId];
                    return n;
                });
            }
            saveMuted(next);
            return next;
        });
    }, []);

    const isMuted = useCallback((channelId: string) => {
        return mutedChannels.has(channelId);
    }, [mutedChannels]);

    useEffect(() => {
        const unsub = chatMessageBus.onMessage((msg: MessageResponse) => {
            if (msg.channelId === activeChannelRef.current) return;
            if (mutedRef.current.has(msg.channelId)) return;
            setUnreadCounts(prev => ({
                ...prev,
                [msg.channelId]: (prev[msg.channelId] ?? 0) + 1,
            }));
        });
        return unsub;
    }, []);

    return (
        <UnreadContext.Provider value={{ unreadCounts, mutedChannels, markRead, toggleMute, isMuted }}>
            {children}
        </UnreadContext.Provider>
    );
}
