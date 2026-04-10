import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Settings } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import AvatarUploadModal from './AvatarUploadModal';
import { userProfilesApi } from '../../api/userProfilesApi';
import { resolveAssetUrl } from '../../api/httpClient';
import { getUserStatusOption } from '../../utils/userStatus';

interface Props {
    onClose: () => void;
    onOpenSettings: () => void;
}

export default function UserProfileCard({ onClose, onOpenSettings }: Props) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { selfUser: user, updateSelfUser, logout } = useAuthContext();
    const statusOption = getUserStatusOption(user?.userStatus ?? 1);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (isModalOpen) {
                return;
            }

            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isModalOpen, onClose]);

    return (
        <div
            ref={ref}
            className="absolute bottom-16 left-4 z-50 bg-[#2b2d31] w-72 rounded-xl border border-[#3a3c42] p-4 text-white shadow-xl"
        >
            <div className="text-sm font-bold mb-2">Личное</div>

            <div className="flex items-center gap-4">
                <img
                    src={resolveAssetUrl(user?.avatarUrl)}
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
                <CheckCircle2 className={`w-4 h-4 ${statusOption.badgeClassName}`} />
                <span>{statusOption.label}</span>
            </div>

            <div className="mt-2 text-xs text-gray-400">
                {user?.bio || 'Добавь био в настройках профиля, чтобы карточка стала живее.'}
            </div>

            <button
                type="button"
                onClick={onOpenSettings}
                className="mt-4 inline-flex items-center gap-2 text-sm text-gray-300 transition hover:text-white"
            >
                <Settings className="h-4 w-4" />
                Открыть настройки профиля
            </button>

            <div className="flex items-center gap-2 text-sm mt-3 text-gray-400">
                <span>@{user?.username}</span>
            </div>

            <button
                onClick={() => void logout()}
                className="text-xs text-gray-400 absolute top-2 right-3 hover:text-white"
            >
                Выйти
            </button>

            {isModalOpen && (
                <AvatarUploadModal
                    currentAvatar={resolveAssetUrl(user!.avatarUrl)}
                    onClose={() => setIsModalOpen(false)}
                    onSave={async (file) => {
                        try {
                            const response = await userProfilesApi.updateAvatar(file);
                            updateSelfUser((currentUser) => currentUser
                                ? {
                                    ...currentUser,
                                    avatarUrl: response.data.url,
                                }
                                : currentUser);
                        } catch (error) {
                            console.error('Ошибка при обновлении аватара:', error);
                            throw error;
                        }
                    }}
                />
            )}

        </div>
    );
}
