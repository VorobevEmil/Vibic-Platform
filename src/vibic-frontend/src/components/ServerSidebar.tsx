export default function ServerSidebar() {
    return (
        <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-4 gap-4">
            {/* Пример сервера */}
            <div className="w-12 h-12 bg-gray-700 rounded-full hover:rounded-2xl transition-all"></div>
            <div className="w-12 h-12 bg-indigo-500 rounded-full hover:rounded-2xl transition-all"></div>
            <button className="w-12 h-12 bg-green-600 rounded-full hover:rounded-2xl transition-all text-white text-lg font-bold">+</button>
        </div>
    );
}
