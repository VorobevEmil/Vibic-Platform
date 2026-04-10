import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useDirectChannel from '../../hooks/chat/useDirectChannel';
import useSignalRChannel from '../../hooks/chat/useSignalRChannel';
import { useChatMessages } from '../../hooks/chat/useChatMessages';
import ChatMessages, { ChatMessagesRef } from './DirectChat/ChatMessages';
import ChatInput from './DirectChat/ChatInput';
import { chatHubConnection } from '../../services/signalRClient';
import { useAuthContext } from '../../context/AuthContext';
import { ChannelType } from '../../types/enums/ChannelType';
import MessageResponse from '../../types/MessageType';
import { messagesApi } from '../../api/messagesApi';
import { filesApi } from '../../api/filesApi';

interface ChatCenterPanelProps {
  channelType: ChannelType;
  serverId?: string;
  channelId: string;
  children?: React.ReactNode;
}

interface DirectMessageLocationState {
  pendingDirectMessage?: string;
  autoSendDirectMessage?: boolean;
}

export default function ChatCenterPanel({ channelType, serverId, channelId, children }: ChatCenterPanelProps) {
  const { selfUser } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [replyTo, setReplyTo] = useState<MessageResponse | null>(null);
  const chatMessagesRef = useRef<ChatMessagesRef>(null);
  const pendingDirectMessageRef = useRef<string | null>(null);
  const isAutoSendingDirectMessageRef = useRef(false);

  const directMessageState = location.state as DirectMessageLocationState | null;

  const { peerUser } = useDirectChannel({
    serverId: serverId,
    channelId: channelId,
    localUserId: selfUser?.id,
  });

  const {
    messages,
    isInitializing,
    messagesEndRef,
    scrollContainerRef,
    isLoadingMore,
    isNearBottom,
    unreadMessageId,
    unreadCount,
    loadMoreMessages,
    initializeMessages,
    appendIncomingMessage,
    deleteMessageById,
    replaceMessage,
    syncSenderMetadata,
    scrollToBottom,
  } = useChatMessages({ serverId, channelId });

  const handleIncomingMessage = useCallback((message: MessageResponse) => {
    appendIncomingMessage(message, {
      forceScroll: message.senderId === selfUser?.id,
    });
  }, [appendIncomingMessage, selfUser?.id]);

  const { sendMessage, connected, typingUsername } = useSignalRChannel(
    channelId,
    handleIncomingMessage,
    deleteMessageById,
    replaceMessage,
  );

  const clearDirectMessageState = useCallback(() => {
    if (!directMessageState?.pendingDirectMessage && !directMessageState?.autoSendDirectMessage) {
      return;
    }

    navigate(location.pathname, { replace: true, state: {} });
  }, [directMessageState?.autoSendDirectMessage, directMessageState?.pendingDirectMessage, location.pathname, navigate]);

  const handleSend = async (files: File[] = []) => {
    const text = inputValue.trim();
    if (!text && files.length === 0) return;
    if (!connected || !selfUser) return;

    // Upload images and build markers
    let imageMarkers = '';
    for (const file of files) {
      try {
        const res = await filesApi.uploadAttachment(file);
        imageMarkers += `%%IMG|${res.data}%%\n`;
      } catch (err) {
        console.error('Failed to upload image:', err);
      }
    }

    const baseContent = imageMarkers + text;
    if (!baseContent.trim()) {
      return;
    }

    const content = replyTo
      ? `%%REPLY|${replyTo.id}|${replyTo.senderUsername}|${replyTo.content.replace(/^%%REPLY\|[^|]+\|[^|]+\|[^%]*%%\n?/, '').slice(0, 120).replace(/\|/g, ' ').replace(/%/g, '')}%%\n${baseContent}`
      : baseContent;

    await sendMessage({
      channelType: channelType,
      serverId: serverId,
      channelId: channelId,
      content,
    });

    setInputValue('');
    setReplyTo(null);
    setTimeout(() => scrollToBottom('smooth'), 50);
  };

  const handleTyping = () => {
    if (chatHubConnection.state === 'Connected' && selfUser?.displayName) {
      chatHubConnection.invoke('SendTypingStatus', channelId, selfUser.displayName);
    }
  };

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    deleteMessageById(messageId);
    try {
      if (serverId) {
        await messagesApi.deleteServerMessage(serverId, channelId, messageId);
      } else {
        await messagesApi.deleteMessage(channelId, messageId);
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  }, [deleteMessageById, channelId, serverId]);

  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      if (serverId) {
        const response = await messagesApi.editServerMessage(serverId, channelId, messageId, newContent);
        replaceMessage(response.data);
      } else {
        const response = await messagesApi.editMessage(channelId, messageId, newContent);
        replaceMessage(response.data);
      }
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  }, [channelId, replaceMessage, serverId]);

  const handleReply = useCallback((message: MessageResponse) => {
    setReplyTo(message);
  }, []);

  useEffect(() => {
    if (!selfUser) {
      return;
    }

    syncSenderMetadata(selfUser.id, {
      senderUsername: selfUser.username,
      senderAvatarUrl: selfUser.avatarUrl,
    });
  }, [selfUser?.avatarUrl, selfUser?.id, selfUser?.username, syncSenderMetadata]);

  useEffect(() => {
    initializeMessages().then(() => {
      requestAnimationFrame(() => {
        const scrollEl = scrollContainerRef.current;
        if (scrollEl && scrollEl.scrollHeight <= scrollEl.clientHeight) {
          loadMoreMessages();
        }
      });
    });
  }, [initializeMessages]);

  useEffect(() => {
    // Сбрасываем ответ при смене канала
    setReplyTo(null);
  }, [channelId]);

  useEffect(() => {
    if (channelType !== ChannelType.Direct) {
      pendingDirectMessageRef.current = null;
      isAutoSendingDirectMessageRef.current = false;
      return;
    }

    const pendingMessage = directMessageState?.autoSendDirectMessage
      ? directMessageState.pendingDirectMessage?.trim()
      : '';

    pendingDirectMessageRef.current = pendingMessage || null;
    isAutoSendingDirectMessageRef.current = false;
  }, [channelId, channelType, directMessageState?.autoSendDirectMessage, directMessageState?.pendingDirectMessage]);

  useEffect(() => {
    if (channelType !== ChannelType.Direct || !connected || !selfUser) {
      return;
    }

    const pendingMessage = pendingDirectMessageRef.current?.trim();

    if (!pendingMessage || isAutoSendingDirectMessageRef.current) {
      return;
    }

    isAutoSendingDirectMessageRef.current = true;

    void sendMessage({
      channelType,
      serverId,
      channelId,
      content: pendingMessage,
    }).then(() => {
      pendingDirectMessageRef.current = null;
      setInputValue('');
      clearDirectMessageState();
      requestAnimationFrame(() => scrollToBottom('smooth'));
    }).catch((error) => {
      console.error('Failed to auto-send direct message:', error);
      setInputValue(pendingMessage);
      isAutoSendingDirectMessageRef.current = false;
    });
  }, [channelId, channelType, clearDirectMessageState, connected, scrollToBottom, selfUser, sendMessage, serverId]);

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;
    const onScroll = () => { if (scrollEl.scrollTop <= 100) loadMoreMessages(); };
    scrollEl.addEventListener('scroll', onScroll);
    return () => scrollEl.removeEventListener('scroll', onScroll);
  }, [loadMoreMessages, scrollContainerRef]);

  return (
    <div className="relative flex flex-col flex-1 h-full bg-[#313338]">

      <div>
        {children}
      </div>

      <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
        <div className="max-w-3xl mx-auto px-4 py-3">
          <ChatMessages
            ref={chatMessagesRef}
            messages={messages}
            isInitializing={isInitializing}
            typingUsername={typingUsername}
            messagesEndRef={messagesEndRef}
            scrollContainerRef={scrollContainerRef}
            isLoadingMore={isLoadingMore}
            unreadMessageId={unreadMessageId}
            unreadCount={unreadCount}
            currentUserId={selfUser?.id}
            serverId={serverId}
            onDeleteMessage={handleDeleteMessage}
            onEditMessage={handleEditMessage}
            onReply={handleReply}
          />
        </div>
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

      <div className="max-w-3xl mx-auto w-full px-4 pb-4">
        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSend={handleSend}
          handleTyping={handleTyping}
          placeholder={serverId ? 'Написать' : (peerUser ? `Написать @${peerUser.displayName}` : 'Написать сообщение')}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </div>
    </div>
  );
}
