import { useEffect, useState } from 'react';
import useDirectChannel from '../../hooks/chat/useDirectChannel';
import useSignalRChannel from '../../hooks/chat/useSignalRChannel';
import { useChatMessages } from '../../hooks/chat/useChatMessages';
import ChatMessages from './DirectChat/ChatMessages';
import ChatInput from './DirectChat/ChatInput';
import { chatHubConnection } from '../../services/signalRClient';
import { useAuthContext } from '../../context/AuthContext';
import { ChannelType } from '../../types/enums/ChannelType';

interface Props {
  channelType: ChannelType;
  serverId?: string;
  channelId: string;
  children?: React.ReactNode;
}

export default function ChatCenterPanel({ channelType, serverId, channelId, children }: Props) {
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
    setMessages,
    messagesEndRef,
    scrollContainerRef,
    isLoadingMore,
    loadMoreMessages,
    initializeMessages,
    scrollToBottom
  } = useChatMessages(
    {
      serverId: serverId,
      channelId: channelId
    }
  );

  const { sendMessage, connected, typingUsername } = useSignalRChannel(channelId, setMessages);

  const handleSend = async () => {
    if (!inputValue.trim() || !connected || !selfUser) return;

    await sendMessage({
      channelType: channelType,
      serverId: serverId,
      channelId: channelId,
      content: inputValue,
    });

    setInputValue('');
    setTimeout(scrollToBottom, 50);
  };

  const handleTyping = () => {
    if (chatHubConnection.state === 'Connected' && selfUser?.displayName) {
      chatHubConnection.invoke('SendTypingStatus', channelId, selfUser.displayName);
    }
  };

  useEffect(() => {
    initializeMessages();
  }, [channelId]);

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;
    const onScroll = () => scrollEl.scrollTop === 0 && loadMoreMessages();
    scrollEl.addEventListener('scroll', onScroll);
    return () => scrollEl.removeEventListener('scroll', onScroll);
  }, [loadMoreMessages]);

  return (
    <div className="relative flex flex-col flex-1 h-full bg-[#313338] border-t border-gray-700">

      <div>
        {children}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" ref={scrollContainerRef}>
        <ChatMessages
          messages={messages}
          typingUsername={typingUsername}
          messagesEndRef={messagesEndRef}
          isLoadingMore={isLoadingMore}
        />
      </div>

      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSend={handleSend}
        handleTyping={handleTyping}
        placeholder={serverId !== null ? 'Написать' : (peerUser ? `Написать @${peerUser.displayName}` : 'Загрузка...')}
      />
    </div>
  );
}