import { Check, MessageCircle, UserMinus, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendsApi } from '../../../api/friendsApi';
import { useToast } from '../../../context/ToastContext';
import { resolveAssetUrl } from '../../../api/httpClient';
import { presenceHubConnection } from '../../../services/signalRClient';
import { resolveOrCreateChannel } from '../../../services/channelService';
import { FriendRequestResponse } from '../../../types/FriendRequestType';
import UserProfileResponse from '../../../types/UserProfileType';
import { getUserStatusOption } from '../../../utils/userStatus';
import Skeleton from '../../ui/Skeleton';

type Tab = 'all' | 'online' | 'pending' | 'incoming' | 'add';

const TABS: { id: Tab; label: string }[] = [
    { id: 'online', label: 'В сети' },
    { id: 'all', label: 'Все' },
    { id: 'pending', label: 'Ожидание' },
    { id: 'incoming', label: 'Входящие' },
];

export default function FriendCenterPanel() {
    const [tab, setTab] = useState<Tab>('all');
    const [friends, setFriends] = useState<UserProfileResponse[]>([]);
    const [incoming, setIncoming] = useState<FriendRequestResponse[]>([]);
    const [outgoing, setOutgoing] = useState<FriendRequestResponse[]>([]);
    const [receiverId, setReceiverId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [friendsRes, incomingRes, pendingRes] = await Promise.all([
                    friendsApi.getFriends(),
                    friendsApi.getIncoming(),
                    friendsApi.getOutgoing()
                ]);
                setFriends(friendsRes.data);
                setIncoming(incomingRes.data);
                setOutgoing(pendingRes.data);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
            } finally {
                setIsLoading(false);
            }
        };
        void fetchData();
    }, [refresh]);

    useEffect(() => {
        const handleStatusChanged = (userId: string, userStatus: number) => {
            setFriends((prev) => prev.map((f) => f.id === userId ? { ...f, userStatus } : f));
            setIncoming((prev) => prev.map((r) => r.userProfile.id === userId
                ? { ...r, userProfile: { ...r.userProfile, userStatus } } : r));
            setOutgoing((prev) => prev.map((r) => r.userProfile.id === userId
                ? { ...r, userProfile: { ...r.userProfile, userStatus } } : r));
        };

        presenceHubConnection.off('UserStatusChanged', handleStatusChanged);
        presenceHubConnection.on('UserStatusChanged', handleStatusChanged);
        return () => { presenceHubConnection.off('UserStatusChanged', handleStatusChanged); };
    }, []);

    const sendRequest = async () => {
        if (!receiverId.trim()) return;
        try {
            await friendsApi.sendFriendRequest(receiverId.trim());
            setReceiverId('');
            setRefresh((r) => !r);
        } catch {
            showToast('error', 'Не удалось отправить запрос', 'Проверьте имя пользователя и попробуйте снова.');
        }
    };

    const acceptRequest = async (id: string) => {
        try { await friendsApi.acceptRequest(id); setRefresh((r) => !r); }
        catch (err) { console.error(err); }
    };

    const rejectRequest = async (id: string) => {
        try { await friendsApi.rejectRequest(id); setRefresh((r) => !r); }
        catch (err) { console.error(err); }
    };

    const startDirectMessage = async (friendId: string) => {
        try {
            const channel = await resolveOrCreateChannel(friendId);
            if (channel) navigate(`/channels/@me/${channel.id}`);
        } catch (err) { console.error(err); }
    };

    const removeFriend = async (friendId: string) => {
        try {
            await friendsApi.removeFriend(friendId);
            setFriends((prev) => prev.filter((f) => f.id !== friendId));
        } catch (err) { console.error(err); }
    };

    const visibleFriends = tab === 'online'
        ? friends.filter((f) => f.userStatus === 1)
        : friends;

    const renderLoadingContent = () => (
        <div className="max-w-2xl space-y-3">
            <Skeleton className="h-3 w-28 rounded-md" />
            {Array.from({ length: tab === 'add' ? 1 : 5 }).map((_, index) => (
                <div
                    key={index}
                    className={`rounded-xl border border-white/[0.05] bg-[#2b2d31] ${
                        tab === 'add' ? 'px-4 py-4' : 'px-4 py-3'
                    }`}
                >
                    {tab === 'add' ? (
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-40 rounded-md" />
                            <Skeleton className="h-3.5 w-72 max-w-full rounded-md" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-11 flex-1 rounded-xl" />
                                <Skeleton className="h-10 w-28 rounded-xl" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-3.5 w-28 rounded-md" />
                                    <Skeleton className="h-3 w-20 rounded-md" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderContent = () => {
        if (isLoading) {
            return renderLoadingContent();
        }

        if (tab === 'add') {
            return (
                <div className="max-w-xl">
                    <h2 className="text-lg font-semibold text-white mb-1">Добавить в друзья</h2>
                    <p className="text-sm text-gray-400 mb-4">
                        Введите ID пользователя, чтобы отправить заявку в друзья.
                    </p>
                    <div className="flex items-center gap-2 bg-[#1e1f22] border border-white/10 rounded-xl px-4 py-1 focus-within:border-indigo-500/50">
                        <input
                            type="text"
                            className="flex-1 bg-transparent text-white text-sm py-2.5 outline-none placeholder-gray-500"
                            value={receiverId}
                            onChange={(e) => setReceiverId(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && void sendRequest()}
                            placeholder="Введите user-id..."
                        />
                        <button
                            onClick={() => void sendRequest()}
                            disabled={!receiverId.trim()}
                            className="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                        >
                            Отправить
                        </button>
                    </div>
                </div>
            );
        }

        if (tab === 'pending') {
            return (
                <div className="space-y-2 max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                        Ожидание — {outgoing.length}
                    </p>
                    {outgoing.length === 0 && (
                        <p className="text-sm text-gray-500">Нет отправленных заявок.</p>
                    )}
                    {outgoing.map(({ userProfile, requestId }) => (
                        <div key={requestId} className="flex items-center justify-between gap-3 px-4 py-3 bg-[#2b2d31] hover:bg-[#313338] border border-white/[0.05] rounded-xl transition-colors group">
                            <div className="flex items-center gap-3">
                                <img
                                    src={resolveAssetUrl(userProfile.avatarUrl)}
                                    alt={userProfile.displayName}
                                    className="w-9 h-9 rounded-full object-cover"
                                />
                                <div>
                                    <div className="text-sm font-semibold text-white">{userProfile.displayName}</div>
                                    <div className="text-xs text-gray-500">Заявка отправлена</div>
                                </div>
                            </div>
                            <button
                                onClick={() => void rejectRequest(requestId)}
                                title="Отменить заявку"
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-400 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            );
        }

        if (tab === 'incoming') {
            return (
                <div className="space-y-2 max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                        Входящие — {incoming.length}
                    </p>
                    {incoming.length === 0 && (
                        <p className="text-sm text-gray-500">Нет входящих заявок.</p>
                    )}
                    {incoming.map(({ userProfile, requestId }) => (
                        <div key={requestId} className="flex items-center justify-between gap-3 px-4 py-3 bg-[#2b2d31] hover:bg-[#313338] border border-white/[0.05] rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                                <img
                                    src={resolveAssetUrl(userProfile.avatarUrl)}
                                    alt={userProfile.displayName}
                                    className="w-9 h-9 rounded-full object-cover"
                                />
                                <div>
                                    <div className="text-sm font-semibold text-white">{userProfile.displayName}</div>
                                    <div className="text-xs text-gray-500">Хочет добавить вас в друзья</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => void acceptRequest(requestId)}
                                    title="Принять"
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-green-500/20 hover:text-green-400 text-gray-400 flex items-center justify-center transition-colors"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => void rejectRequest(requestId)}
                                    title="Отклонить"
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-400 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="space-y-1 max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                    {tab === 'online' ? 'В сети' : 'Все друзья'} — {visibleFriends.length}
                </p>
                {visibleFriends.length === 0 && (
                    <p className="text-sm text-gray-500">
                        {tab === 'online' ? 'Нет друзей в сети.' : 'Список друзей пуст.'}
                    </p>
                )}
                {visibleFriends.map((friend) => {
                    const statusOption = getUserStatusOption(friend.userStatus);
                    return (
                        <div
                            key={friend.id}
                            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-[#2b2d31] border border-transparent hover:border-white/[0.05] transition-all group cursor-pointer"
                            onClick={() => void startDirectMessage(friend.id)}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative shrink-0">
                                    <img
                                        src={resolveAssetUrl(friend.avatarUrl)}
                                        alt={friend.displayName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <span
                                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#313338] ${statusOption.badgeClassName.replace('text-', 'bg-').split(' ')[0]}`}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-white truncate">{friend.displayName}</div>
                                    <div className={`text-xs truncate ${statusOption.badgeClassName}`}>{statusOption.label}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 text-gray-400 flex items-center justify-center transition-colors"
                                    onClick={(e) => { e.stopPropagation(); void startDirectMessage(friend.id); }}
                                    title="Написать сообщение"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </button>
                                <button
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-400 flex items-center justify-center transition-colors"
                                    onClick={(e) => { e.stopPropagation(); void removeFriend(friend.id); }}
                                    title="Удалить из друзей"
                                >
                                    <UserMinus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex-1 bg-[#313338] flex flex-col overflow-hidden">
            {/* Header / Tab bar */}
            <div className="flex items-center gap-1 px-6 py-3 border-b border-white/[0.06] shrink-0">
                {TABS.map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`relative text-sm px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                            tab === id
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]'
                        }`}
                    >
                        {label}
                        {id === 'incoming' && incoming.length > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {incoming.length}
                            </span>
                        )}
                    </button>
                ))}

                <button
                    onClick={() => setTab('add')}
                    className={`ml-auto flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                        tab === 'add'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200'
                    }`}
                >
                    <UserPlus className="w-3.5 h-3.5" />
                    Добавить друга
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
                {renderContent()}
            </div>
        </div>
    );
}
