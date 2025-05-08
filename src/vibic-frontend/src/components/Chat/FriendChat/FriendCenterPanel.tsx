import { MessageCircle, MoreVertical, X } from 'lucide-react';
import { friendsApi } from '../../../api/friendsApi';
import UserProfileResponse from '../../../types/UserProfileType';
import { useEffect, useState } from 'react';
import { FriendRequestResponse } from '../../../types/FriendRequestType';


type Tab = 'all' | 'online' | 'pending' | 'incoming' | 'add';

export default function FriendCenterPanel() {
    const [tab, setTab] = useState<Tab>('all');
    const [friends, setFriends] = useState<UserProfileResponse[]>([]);
    const [incoming, setIncoming] = useState<FriendRequestResponse[]>([]);
    const [outgoing, setOutgoing] = useState<FriendRequestResponse[]>([]);
    const [receiverId, setReceiverId] = useState('');
    const [refresh, setRefresh] = useState(false);

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

        fetchData();
    }, [refresh]);

    const sendRequest = async () => {
        if (!receiverId) return;
        try {
            await friendsApi.sendFriendRequest(receiverId);
            setReceiverId('');
            setRefresh((r) => !r);
        } catch (err) {
            alert('Не удалось отправить запрос');
        }
    };

    const acceptRequest = async (id: string) => {
        await friendsApi.acceptRequest(id);
        setRefresh((r) => !r);
    };

    const rejectRequest = async (id: string) => {
        await friendsApi.rejectRequest(id);
        setRefresh((r) => !r);
    };

    const renderContent = () => {
        if (tab === 'add') {
            return (
                <div className="p-4 bg-[#2b2d31] rounded-md">
                    <h2 className="text-white text-lg mb-2">Добавить в друзья</h2>
                    <p className="text-gray-400 text-sm mb-3">Введите имя пользователя для отправки запроса.</p>
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
                            <X className="text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => rejectRequest(requestId)} />
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
                                <button onClick={() => acceptRequest(requestId)} className="text-green-500 hover:underline">Принять</button>
                                <button onClick={() => rejectRequest(requestId)} className="text-red-500 hover:underline">Отклонить</button>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 bg-[#2b2d31] rounded-md">
                        <div className="flex items-center gap-3">
                            <img src={friend.avatarUrl} alt={friend.displayName} className="w-10 h-10 rounded-full" />
                            <div className="text-white">{friend.displayName}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-[#4e5058] rounded-full">
                                <MessageCircle className="text-gray-400 hover:text-white" />
                            </button>
                            <button className="p-2 hover:bg-[#4e5058] rounded-full">
                                <MoreVertical className="text-gray-400 hover:text-white" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex-1 bg-[#313338] p-6 overflow-y-auto">
            {/* Навигация */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setTab('online')} className={`text-sm px-3 py-1 rounded-lg h-full ${tab === 'online' ? 'bg-[#404249] text-white' : 'text-gray-400 hover:text-white'}`}>В сети</button>
                <button onClick={() => setTab('all')} className={`text-sm px-3 py-1 rounded-lg h-full ${tab === 'all' ? 'bg-[#404249] text-white' : 'text-gray-400 hover:text-white'}`}>Все</button>
                <button onClick={() => setTab('pending')} className={`text-sm px-3 py-1 rounded-lg h-full ${tab === 'pending' ? 'bg-[#404249] text-white' : 'text-gray-400 hover:text-white'}`}>Ожидание</button>
                <button onClick={() => setTab('incoming')} className={`text-sm px-3 py-1 rounded-lg h-full ${tab === 'incoming' ? 'bg-[#404249] text-white' : 'text-gray-400 hover:text-white'}`}>Входящие</button>
                <button onClick={() => setTab('add')} className="ml-auto bg-indigo-500 hover:bg-indigo-400 text-sm px-4 py-1 rounded-lg text-white h-full">
                    Добавить в друзья
                </button>
            </div>

            {/* Контент */}
            {renderContent()}
        </div>
    );
}
