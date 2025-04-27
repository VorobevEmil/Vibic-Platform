interface ServerChatCenterPanelProps {
    channelId: string;
    name: string;
}

export default function ServerChatCenterPanel({ channelId, name }: ServerChatCenterPanelProps) {
    return (
        <div className="flex-1 flex flex-col bg-[#313338]">
            {/* Header */}
            <div className="h-14 px-4 flex items-center border-b border-[#1e1f22]">
                <h1 className="text-lg font-bold text-white"># {name}</h1>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="text-gray-400">Сообщения канала будут здесь...</div>
            </div>

            {/* Input */}
            <div className="h-16 px-4 flex items-center border-t border-[#1e1f22] bg-[#383a40]">
                <input
                    type="text"
                    placeholder="Написать сообщение"
                    className="flex-1 bg-[#1e1f22] rounded-md px-4 py-2 text-sm text-white placeholder-gray-400 outline-none"
                />
            </div>
        </div>
    );
}
