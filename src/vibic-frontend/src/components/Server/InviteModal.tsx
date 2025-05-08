import { useEffect, useState } from 'react';
import { Copy, Link2 } from 'lucide-react';
import { invitesApi } from '../../api/invitesApi';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    serverId: string;
}

export default function InviteModal({ isOpen, onClose, serverId }: InviteModalProps) {
    const [inviteUrl, setInviteUrl] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            generateInvite();
        }
    }, [isOpen]);

    const generateInvite = async () => {
        try {
            const response = await invitesApi.createInvite(serverId);
            const url = `${window.location.origin}/invite/${response.data.code}`;
            setInviteUrl(url);
        } catch (error) {
            console.error('Ошибка при создании ссылки приглашения:', error);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('Ошибка копирования ссылки:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-[#2B2D31] w-full max-w-md rounded-lg p-6 relative shadow-xl">

                {/* Кнопка закрытия */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">&times;</button>

                <h2 className="text-white text-xl font-bold mb-2">Пригласить на сервер</h2>
                <p className="text-gray-400 text-sm mb-4">Скопируйте и отправьте ссылку другу</p>

                {/* Отображение ссылки */}
                <div className="mb-6">
                    <label className="text-sm text-gray-400 mb-1 block">Ссылка приглашения</label>
                    <div className="relative mt-1 flex items-center">
                        <Link2 className="absolute left-3 text-gray-400" />
                        <input
                            type="text"
                            readOnly
                            value={inviteUrl}
                            className="w-full pl-10 pr-28 py-2 rounded bg-[#1E1F22] text-white text-sm placeholder-gray-500 outline-none"
                        />
                        <button
                            onClick={handleCopy}
                            className="absolute right-2 px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                        >
                            {copied ? 'Скопировано!' : 'Скопировать'}
                        </button>
                    </div>
                </div>

                {/* Кнопки */}
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">Закрыть</button>
                </div>
            </div>
        </div>
    );
}
