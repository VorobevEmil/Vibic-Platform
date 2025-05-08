import MessageResponse from '../../../types/MessageType';

interface ChatMessageProps {
  messages: MessageResponse[];
  typingUsername: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isLoadingMore: boolean;
}

export default function ChatMessages({ messages, typingUsername, messagesEndRef, isLoadingMore }: ChatMessageProps) {
  return (
    <>
      {isLoadingMore && (
        <div className="text-sm text-gray-400 text-center animate-pulse">Загрузка сообщений...</div>
      )}

      {messages.map((msg) => (
        <div key={msg.id} className="flex items-start gap-3">
          <img src={msg.senderAvatarUrl} className="w-8 h-8 rounded-full" />
          <div>
            <div className="text-sm font-semibold text-white">
              {msg.senderUsername}
              <span className="text-xs text-gray-400 ml-2">
                {new Date(msg.sentAt).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-300 mt-1 whitespace-pre-line">{msg.content}</div>
          </div>
        </div>
      ))}

      {typingUsername && (
        <div className="text-sm text-gray-400 mt-2 ml-2 animate-pulse">
          {typingUsername} печатает...
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  );
}
