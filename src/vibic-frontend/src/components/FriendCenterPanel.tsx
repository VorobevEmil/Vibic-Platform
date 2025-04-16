import { MessageCircle, MoreVertical } from 'lucide-react';

export default function FriendCenterPanel() {
    const friendsOnline = [
        { name: 'IFAITHU', game: 'Naruto X Boruto: Ultimate Ninja Storm 4', avatar: 'https://cdn.discordapp.com/avatars/440930175690211340/3202220dfd214c81e1e1e6bc554fbabb.webp?size=64' },
    ];

    return (
        <div className="flex-1 bg-[#313338] p-6 flex flex-col overflow-y-auto">
            {/* Навигация */}
            <div className="flex items-center gap-3 mb-6 min-h-8">
                <button className="text-sm text-white bg-[#404249] px-3 py-1 rounded-lg  h-full">В сети</button>
                <button className="text-sm text-gray-400 hover:text-white h-full">Все</button>
                <button className="ml-auto bg-indigo-500 hover:bg-indigo-400 text-sm px-4 py-1 rounded-lg text-white h-full">
                    Добавить в друзья
                </button>
            </div>

            {/* Список друзей */}
            <div className="space-y-3">
                {friendsOnline.map((friend) => (
                    <div key={friend.name} className="flex items-center justify-between hover:rounded-md hover:bg-[#2b2d31] p-3 rounded">
                        <div className="flex items-center gap-3">
                            <img src={friend.avatar} className="w-10 h-10 rounded-full" alt={friend.name} />
                            <div>
                                <div className="font-medium">{friend.name}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-full hover:bg-[#4e5058] transition-colors duration-150">
                                <MessageCircle className="w-5 h-5  text-gray-400 hover:text-white" />
                            </button>
                            <button className="p-2 rounded-full hover:bg-[#4e5058] transition-colors duration-150">
                                <MoreVertical className="w-5 h-5  text-gray-400 hover:text-white" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
