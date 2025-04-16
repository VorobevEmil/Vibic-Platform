import { useEffect, useState } from 'react';
import FooterProfilePanel from './FooterProfilePanel';
import { X } from 'lucide-react';
import { channelsApi } from '../api/channelsApi';
import SearchOverlay from './SearchOverlay';
type Participant = {
    id: string;
    username: string;
    avatarUrl?: string | null;
};

type Channel = {
    id: string;
    type: string;
    participants: Participant[];
};

export default function DMListSidebar() {
    const currentUserId = 'user-1'; // ← заменить на реальный ID пользователя (через контекст или API)
    const [dms, setDms] = useState<Channel[]>([]);

    useEffect(() => {
        const fetchDMs = async () => {
            try {
                const response = await channelsApi.me();
                const dmChannels = response.data;
                setDms(dmChannels);
            } catch (err) {
                console.error('Failed to load channels:', err);
            }
        };

        fetchDMs();
    }, []);

    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <div className="w-64 bg-[#2b2d31] flex flex-col justify-between">
            <div className="p-4">
                <button
                    onClick={() => setSearchOpen(true)}
                    className="w-full text-left px-3 py-2 rounded-md bg-[#1e1f22] text-sm text-white placeholder-gray-400 hover:bg-[#3c3e45] transition"
                >
                    Найти или начать беседу
                </button>
                <div className="mt-4 text-sm text-gray-400">Личные сообщения</div>

                <div className="mt-2 space-y-2">
                    {dms.map((dm) => {
                        const other = dm.participants.find(p => p.id !== currentUserId);
                        if (!other) return null;

                        return (
                            <div
                                key={dm.id}
                                className="group flex items-center justify-between gap-2 p-2 hover:bg-[#3c3e45] rounded-lg cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <img
                                        src={other.avatarUrl || 'https://via.placeholder.com/32'}
                                        className="w-8 h-8 rounded-full"
                                        alt={other.username}
                                    />
                                    <span className="text-sm">{other.username}</span>
                                </div>

                                <button
                                    className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => console.log(`Close DM with ${other.username}`)}
                                >
                                    <X className="h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <FooterProfilePanel />

            <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
