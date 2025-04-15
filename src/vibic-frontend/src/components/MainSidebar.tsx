export default function MainSidebar() {
    return (
        <div className="w-64 bg-[#2b2d31] p-4 flex flex-col">
            <div className="text-sm text-gray-300 mb-2">Друзья</div>
            <input
                type="text"
                placeholder="Поиск"
                className="bg-gray-800 text-sm text-white px-3 py-2 rounded mb-4"
            />
            <div className="text-xs uppercase text-gray-500 mb-2">Личные сообщения</div>
            <div className="flex flex-col gap-2 overflow-y-auto">
                {['user1', 'user2', 'user3'].map((name) => (
                    <div key={name} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded">
                        <div className="w-8 h-8 rounded-full bg-gray-500"></div>
                        <span className="text-sm">{name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
