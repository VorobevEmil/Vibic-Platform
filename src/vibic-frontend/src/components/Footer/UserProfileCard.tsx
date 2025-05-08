import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import AvatarUploadModal from './AvatarUploadModal';
import { userProfilesApi } from '../../api/userProfilesApi';

interface Props {
    onClose: () => void;
}

export default function UserProfileCard({ onClose }: Props) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { selfUser: user, updateSelfUser } = useAuthContext();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div
            ref={ref}
            className="absolute bottom-16 left-4 z-50 bg-[#2b2d31] w-72 rounded-xl border border-[#3a3c42] p-4 text-white shadow-xl"
        >
            <div className="text-sm font-bold mb-2">Личное</div>

            <div className="flex items-center gap-4">
                <img
                    src={user?.avatarUrl}
                    onClick={() => setIsModalOpen(true)}
                    className="w-14 h-14 rounded-full border-2 border-white cursor-pointer hover:brightness-110"
                />
                <div>
                    <div className="font-bold">{user?.displayName}</div>
                    <div className="text-xs text-gray-400">{user?.username}</div>
                    <div className="text-xs text-gray-500">Моя учетная запись Vibic</div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm mt-4">
                <CheckCircle2 className="text-green-400 w-4 h-4" />
                <span>Доступен</span>
            </div>

            <div className="flex items-center gap-2 text-sm mt-3 text-gray-400 cursor-pointer hover:text-white">
                <span>✏️ Задать подпись к статусу</span>
            </div>

            <button
                onClick={onClose}
                className="text-xs text-gray-400 absolute top-2 right-3 hover:text-white"
            >
                Выйти
            </button>

            {isModalOpen && (
                <AvatarUploadModal
                    currentAvatar={user!.avatarUrl}
                    onClose={() => setIsModalOpen(false)}
                    onSave={async (file) => {
                        if (!file) return;

                        try {
                            const response = await userProfilesApi.updateAvatar(file);
                            updateSelfUser({
                                ...user!,
                                avatarUrl: response.data.url,
                            });
                            setIsModalOpen(false);
                        } catch (error) {
                            console.error('Ошибка при обновлении аватара:', error);
                        }
                    }}
                />
            )}

        </div>
    );
}
