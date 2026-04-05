import { MessageCircle, UserMinus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendsApi } from '../../../api/friendsApi';
import { resolveAssetUrl } from '../../../api/httpClient';
import { presenceHubConnection } from '../../../services/signalRClient';
import { resolveOrCreateChannel } from '../../../services/channelService';
import { FriendRequestResponse } from '../../../types/FriendRequestType';
import UserProfileResponse from '../../../types/UserProfileType';

type Tab = 'all' | 'online' | 'pending' | 'incoming' | 'add';

export default function FriendCenterPanel() {
    const [tab, setTab] = useState<Tab>('all');
    const [friends, setFriends] = useState<UserProfileResponse[]>([]);
    const [incoming, setIncoming] = useState<FriendRequestResponse[]>([]);
    const [outgoing, setOutgoing] = useState<FriendRequestResponse[]>([]);
    const [receiverId, setReceiverId] = useState('');
    const [refresh, setRefresh] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
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
            }
        };

        void fetchData();
    }, [refresh]);

    useEffect(() => {
        const handleStatusChanged = (userId: string, userStatus: number) => {
            setFriends((prev) => prev.map((friend) => friend.id === userId
                ? { ...friend, userStatus }
                : friend));

            setIncoming((prev) => prev.map((request) => request.userProfile.id === userId
                ? { ...request, userProfile: { ...request.userProfile, userStatus } }
                : request));

            setOutgoing((prev) => prev.map((request) => request.userProfile.id === userId
                ? { ...request, userProfile: { ...request.userProfile, userStatus } }
                : request));
        };

        presenceHubConnection.off('UserStatusChanged', handleStatusChanged);
        presenceHubConnection.on('UserStatusChanged', handleStatusChanged);

        return () => {
            presenceHubConnection.off('UserStatusChanged', handleStatusChanged);
        };
    }, []);

    const sendRequest = async () => {
        if (!receiverId) return;
        try {
            await friendsApi.sendFriendRequest(receiverId);
            setReceiverId('');
            setRefresh((r) => !r);
        } catch {
            alert('Не удалось отправить запрос');
        }
    };

    const acceptRequest = async (id: string) => {
        try {
            await friendsApi.acceptRequest(id);
            setRefresh((r) => !r);
        } catch (err) {
            console.error('Ошибка при принятии заявки:', err);
        }
    };

    const rejectRequest = async (id: string) => {
        try {
            await friendsApi.rejectRequest(id);
            setRefresh((r) => !r);
        } catch (err) {
            console.error('Ошибка при отклонении заявки:', err);
        }
    };

    const startDirectMessage = async (friendId: string) => {
        try {
            const channel = await resolveOrCreateChannel(friendId);

            if (channel) {
                navigate(`/channels/@me/${channel.id}`);
            }
        } catch (err) {
            console.error('Ошибка при открытии личного сообщения:', err);
        }
    };

    const removeFriend = async (friendId: string) => {
        try {
            await friendsApi.removeFriend(friendId);
            setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
        } catch (err) {
            console.error('Ошибка при удалении друга:', err);
        }
    };

    const visibleFriends = tab === 'online'
        ? friends.filter((friend) => friend.userStatus === 1)
        : friends;

    const renderContent = () => {
        if (tab === 'add') {
            return (
                <div className="p-4 bg-[#2b2d31] rounded-md">
                    <h2 className="text-white text-lg mb-2">Добавить в друзья</h2>
                    <p className="text-gray-400 text-sm mb-3">Введите id пользователя для отправки запроса.</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-[#1e1f22] text-white px-3 py-2 rounded-md"
                            value={receiverId}
                            onChange={(e) => setReceiverId(e.target.value)}
                            placeholder="user-id"
                        />
                        <button
                            onClick={sendRequest}
                            className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-md"
                        >
                            Отправить запрос
                        </button>
                    </div>
                </div>
            );
        }

        if (tab === 'pending') {
            return (
                <div>
                    <h3 className="text-white mb-3">Отправленные заявки</h3>
                    {outgoing.map(({ userProfile, requestId }) => (
                        <div key={requestId} className="flex items-center justify-between p-3 bg-[#2b2d31] rounded-md mb-2">
                            <div className="text-white">{userProfile.displayName}</div>
                            <X className="text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => void rejectRequest(requestId)} />
                        </div>
                    ))}
                </div>
            );
        }

        if (tab === 'incoming') {
            return (
                <div>
                    <h3 className="text-white mb-3">Входящие заявки</h3>
                    {incoming.map(({ userProfile, requestId }) => (
                        <div key={requestId} className="flex items-center justify-between p-3 bg-[#2b2d31] rounded-md mb-2">
                            <div className="text-white">{userProfile.displayName}</div>
                            <div className="flex gap-2">
                                <button onClick={() => void acceptRequest(requestId)} className="text-green-500 hover:underline">Принять</button>
                                <button onClick={() => void rejectRequest(requestId)} className="text-red-500 hover:underline">Отклонить</button>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {visibleFriends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 bg-[#2b2d31] rounded-md">
                        <div className="flex items-center gap-3">
                            <img src={resolveAssetUrl(friend.avatarUrl)} alt={friend.displayName} className="w-10 h-10 rounded-full" />
                            <div>
                                <div className="text-white">{friend.displayName}</div>
                                <div className="text-xs text-gray-400">
                                    {friend.userStatus === 1 ? 'Online' : 'Offline'}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="p-2 hover:bg-[#4e5058] rounded-full"
                                onClick={() => void startDirectMessage(friend.id)}
                                title="Open direct message"
                            >
                                <MessageCircle className="text-gray-400 hover:text-white" />
                            </button>
                            <button
                                className="p-2 hover:bg-[#4e5058] rounded-full"
                                onClick={() => void removeFriend(friend.id)}
                                title="Remove friend"
                            >
                                <UserMinus className="text-gray-400 hover:text-white" />
                            </button>
                        </div>
                    </div>
                ))}

                {visibleFriends.length === 0 && (
                    <div className="text-sm text-gray-400">
                        {tab === 'online' ? 'Нет друзей онлайн.' : 'Список друзей пока пуст.'}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 bg-[#313338] p-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setTab('online')} className={`text-sm px-3 py-1 rounded-lg h-full ${tab === 'online' ? 'bg-[#404249] text-white' : 'text-gray-400 hover:text-white'}`}>В сети</button>
                <button onClick={() => setTab('all')} className={`text-sm px-3 py-1 rounded-lg h-full ${tab === 'all' ? 'bg-[#404249] text-white' : 'text-gray-400 hover:text-white'}`}>Все</button>
                <button onClick={() => setTab('pending')} className={`text-sm px-3 py-1 rounded-lg h-full ${tab === 'pending' ? 'bg-[#404249] text-white' : 'text-gray-400 hover:text-white'}`}>Ожидание</button>
                <button onClick={() => setTab('incoming')} className={`text-sm px-3 py-1 rounded-lg h-full ${tab === 'incoming' ? 'bg-[#404249] text-white' : 'text-gray-400 hover:text-white'}`}>Входящие</button>
                <button onClick={() => setTab('add')} className="ml-auto bg-indigo-500 hover:bg-indigo-400 text-sm px-4 py-1 rounded-lg text-white h-full">
                    Добавить в друзья
                </button>
            </div>

            {renderContent()}
        </div>
    );
}
