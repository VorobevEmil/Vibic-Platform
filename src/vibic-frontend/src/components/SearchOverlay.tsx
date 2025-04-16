import { useEffect, useState } from 'react';
import { userProfilesApi } from '../api/userProfilesApi';
import { Smile } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type User = {
    id: string;
    username: string;
    avatarUrl?: string | null;
};

export default function SearchOverlay({ isOpen, onClose }: Props) {
    const [searchChannel, setSearchChannel] = useState('');
    const [results, setResults] = useState<User[]>([]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                setSearchChannel('');
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        const fetch = async () => {
            if (searchChannel.trim().length === 0) {
                setResults([]);
                return;
            }

            try {
                const response = await userProfilesApi.search(searchChannel);
                setResults(response.data);
            } catch (error) {
                console.error('Ошибка поиска:', error);
                setResults([]);
            }
        };

        fetch();
    }, [searchChannel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#2b2d31] text-white w-full max-w-xl rounded-lg p-6 shadow-lg">
                <h2 className="text-center mb-4 text-lg">Поиск серверов, каналов или ЛС</h2>

                <input
                    type="text"
                    autoFocus
                    placeholder="Куда отправимся?"
                    className="w-full mb-4 px-4 py-2 rounded bg-[#1e1f22] placeholder-gray-400 text-sm"
                    value={searchChannel}
                    onChange={(e) => setSearchChannel(e.target.value)}
                />

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {results.length === 0 && searchChannel.trim() !== '' ? (
                        <div className="text-sm text-gray-400">Ничего не найдено</div>
                    ) : (
                        results.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-3 px-3 py-2 bg-[#3c3e45] rounded hover:bg-[#4b4e58] cursor-pointer transition"
                            >
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.username}
                                        className="w-8 h-8 rounded-full"
                                    />
                                ) : (
                                    <Smile className="w-8 h-8 rounded-full grayscale" />
                                )}

                                <span className="text-sm">{user.username}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}