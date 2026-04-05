import { useCallback, useEffect, useState } from 'react';
import useDirectChannel from '../../hooks/chat/useDirectChannel';
import useSignalRChannel from '../../hooks/chat/useSignalRChannel';
import { useChatMessages } from '../../hooks/chat/useChatMessages';
import ChatMessages from './DirectChat/ChatMessages';
import ChatInput from './DirectChat/ChatInput';
import { chatHubConnection } from '../../services/signalRClient';
import { useAuthContext } from '../../context/AuthContext';
import { ChannelType } from '../../types/enums/ChannelType';
import MessageResponse from '../../types/MessageType';

interface ChatCenterPanelProps {
  channelType: ChannelType;
  serverId?: string;
  channelId: string;
  children?: React.ReactNode;
}

export default function ChatCenterPanel({ channelType, serverId, channelId, children }: ChatCenterPanelProps) {
  const { selfUser } = useAuthContext();
  const [inputValue, setInputValue] = useState('');
  const peerUser = useDirectChannel(
    {
      serverId: serverId,
      channelId: channelId,
      localUserId: selfUser?.id
    });

  const {
    messages,
    messagesEndRef,
    scrollContainerRef,
    isLoadingMore,
    isNearBottom,
    unreadMessageId,
    unreadCount,
    loadMoreMessages,
    initializeMessages,
    appendIncomingMessage,
    scrollToBottom
  } = useChatMessages(
    {
      serverId: serverId,
      channelId: channelId
    }
  );

  const handleIncomingMessage = useCallback((message: MessageResponse) => {
    appendIncomingMessage(message, {
      forceScroll: message.senderId === selfUser?.id,
    });
  }, [appendIncomingMessage, selfUser?.id]);

  const { sendMessage, connected, typingUsername } = useSignalRChannel(channelId, handleIncomingMessage);

  const handleSend = async () => {
    if (!inputValue.trim() || !connected || !selfUser) return;

    await sendMessage({
      channelType: channelType,
      serverId: serverId,
      channelId: channelId,
      content: inputValue,
    });

    setInputValue('');
    setTimeout(() => scrollToBottom('smooth'), 50);
  };

  const handleTyping = () => {
    if (chatHubConnection.state === 'Connected' && selfUser?.displayName) {
      chatHubConnection.invoke('SendTypingStatus', channelId, selfUser.displayName);
    }
  };

  useEffect(() => {
    initializeMessages();
  }, [initializeMessages]);

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;
    const onScroll = () => scrollEl.scrollTop <= 0 && loadMoreMessages();
    scrollEl.addEventListener('scroll', onScroll);
    return () => scrollEl.removeEventListener('scroll', onScroll);
  }, [loadMoreMessages, scrollContainerRef]);

  return (
    <div className="relative flex flex-col flex-1 h-full bg-[#313338] border-t border-gray-700">

      <div>
        {children}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3" ref={scrollContainerRef}>
        <ChatMessages
          messages={messages}
          typingUsername={typingUsername}
          messagesEndRef={messagesEndRef}
          isLoadingMore={isLoadingMore}
          scrollContainerRef={scrollContainerRef}
          unreadMessageId={unreadMessageId}
          unreadCount={unreadCount}
        />
      </div>

      {(!isNearBottom || unreadCount > 0) && (
        <div className="absolute bottom-24 right-6 z-10">
          <button
            type="button"
            onClick={() => scrollToBottom('smooth')}
            className="rounded-full border border-sky-400/30 bg-[#1f2024]/95 px-4 py-2 text-xs font-semibold text-sky-200 shadow-lg backdrop-blur transition hover:border-sky-300/60 hover:text-white"
          >
            {unreadCount > 0 ? `К новым сообщениям (${unreadCount})` : 'К последним сообщениям'}
          </button>
        </div>
      )}

      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSend={handleSend}
        handleTyping={handleTyping}
        placeholder={serverId ? 'Написать' : (peerUser ? `Написать @${peerUser.displayName}` : 'Загрузка...')}
      />
    </div>
  );
}
