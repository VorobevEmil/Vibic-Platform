import { useCallback, useEffect, useRef, useState } from 'react';
import { messagesApi } from '../../api/messagesApi';
import MessageResponse from '../../types/MessageType';

interface Props {
  serverId?: string;
  channelId: string
}

const NEAR_BOTTOM_THRESHOLD_PX = 220;

export function useChatMessages({ serverId, channelId }: Props) {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [unreadMessageId, setUnreadMessageId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<MessageResponse[]>([]);
  const isNearBottomRef = useRef(true);
  const pendingScrollRef = useRef<ScrollBehavior | false>(false);

  // Stable refs so loadMoreMessages doesn't recreate on every state change
  const cursorRef = useRef<string | undefined>(undefined);
  const hasMoreRef = useRef(true);
  const isLoadingMoreRef = useRef(false);

  const clearUnreadState = useCallback(() => {
    setUnreadMessageId(null);
    setUnreadCount(0);
  }, []);

  const scrollContainerToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const scrollEl = scrollContainerRef.current;

    if (!scrollEl) {
      return;
    }

    scrollEl.scrollTo({
      top: scrollEl.scrollHeight,
      behavior,
    });
  }, []);

  const updateBottomState = useCallback(() => {
    const scrollEl = scrollContainerRef.current;

    if (!scrollEl) {
      return;
    }

    const distanceFromBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
    const nextIsNearBottom = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD_PX;

    isNearBottomRef.current = nextIsNearBottom;
    setIsNearBottom(nextIsNearBottom);

    if (nextIsNearBottom) {
      clearUnreadState();
    }
  }, [clearUnreadState]);

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;

    if (!scrollEl) {
      return;
    }

    updateBottomState();

    const handleScroll = () => {
      updateBottomState();
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollEl.removeEventListener('scroll', handleScroll);
    };
  }, [updateBottomState]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    scrollContainerToBottom(behavior);
    requestAnimationFrame(() => {
      updateBottomState();
    });
  }, [scrollContainerToBottom, updateBottomState]);

  const initializeMessages = useCallback(async () => {
    clearUnreadState();
    isNearBottomRef.current = true;
    setIsNearBottom(true);
    messagesRef.current = [];
    setMessages([]);
    cursorRef.current = undefined;
    hasMoreRef.current = true;
    isLoadingMoreRef.current = false;
    setIsLoadingMore(false);

    try {
      let response = null;
      if (serverId) {
        response = await messagesApi.getMessagesByServerIdAndChannelId(serverId, channelId);
      }
      else {
        response = await messagesApi.getMessagesByChannelId(channelId);
      }
      messagesRef.current = response.data.items;
      setMessages(response.data.items);
      cursorRef.current = response.data.cursor;
      hasMoreRef.current = response.data.hasMore;
      pendingScrollRef.current = 'auto';
    } catch (error) {
      console.log("Ошибка во время инициализации сообщении", error)
    }
  }, [channelId, clearUnreadState, serverId]);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreRef.current || isLoadingMoreRef.current) return;
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;

    const prevScrollHeight = scrollEl.scrollHeight;
    const prevScrollTop = scrollEl.scrollTop;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      let response = null;
      if (serverId) {
        response = await messagesApi.getMessagesByServerIdAndChannelId(serverId!, channelId, cursorRef.current);
      }
      else {
        response = await messagesApi.getMessagesByChannelId(channelId, cursorRef.current);
      }

      const nextMessages = [...response.data.items, ...messagesRef.current];
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
      cursorRef.current = response.data.cursor;
      hasMoreRef.current = response.data.hasMore;
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);

      setTimeout(() => {
        scrollEl.scrollTop = scrollEl.scrollHeight - prevScrollHeight + prevScrollTop;
      }, 10);
    } catch (error) {
      console.error('Ошибка при загрузке сообщений:', error);
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [channelId, serverId]);

  const appendIncomingMessage = useCallback((
    message: MessageResponse,
    options?: { forceScroll?: boolean }
  ) => {
    if (messagesRef.current.some((currentMessage) => currentMessage.id === message.id)) {
      return;
    }

    const nextMessages = [...messagesRef.current, message];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);

    if (options?.forceScroll || isNearBottomRef.current) {
      clearUnreadState();
      pendingScrollRef.current = 'auto';
      return;
    }

    setUnreadMessageId((currentUnreadMessageId) => currentUnreadMessageId ?? message.id);
    setUnreadCount((currentUnreadCount) => currentUnreadCount + 1);
  }, [clearUnreadState]);

  // Скролл вниз после того как React закоммитил новое сообщение в DOM
  useEffect(() => {
    const behavior = pendingScrollRef.current;
    if (!behavior) return;
    pendingScrollRef.current = false;
    requestAnimationFrame(() => scrollToBottom(behavior));
  }, [messages, scrollToBottom]);

  const deleteMessageById = useCallback((messageId: string) => {
    const next = messagesRef.current.filter(m => m.id !== messageId);
    messagesRef.current = next;
    setMessages(next);
  }, []);

  const updateMessageContent = useCallback((messageId: string, newContent: string) => {
    const next = messagesRef.current.map(m =>
      m.id === messageId ? { ...m, content: newContent, isEdited: true } : m
    );
    messagesRef.current = next;
    setMessages(next);
  }, []);

  const syncSenderMetadata = useCallback((
    senderId: string,
    updates: { senderUsername?: string; senderAvatarUrl?: string | null }
  ) => {
    let hasChanges = false;

    const nextMessages = messagesRef.current.map((message) => {
      if (message.senderId !== senderId) {
        return message;
      }

      const nextUsername = updates.senderUsername ?? message.senderUsername;
      const nextAvatarUrl = updates.senderAvatarUrl ?? message.senderAvatarUrl;

      if (nextUsername === message.senderUsername && nextAvatarUrl === message.senderAvatarUrl) {
        return message;
      }

      hasChanges = true;

      return {
        ...message,
        senderUsername: nextUsername,
        senderAvatarUrl: nextAvatarUrl,
      };
    });

    if (!hasChanges) {
      return;
    }

    messagesRef.current = nextMessages;
    setMessages(nextMessages);
  }, []);

  return {
    messages,
    scrollContainerRef,
    messagesEndRef,
    isLoadingMore,
    isNearBottom,
    unreadMessageId,
    unreadCount,
    loadMoreMessages,
    initializeMessages,
    appendIncomingMessage,
    deleteMessageById,
    updateMessageContent,
    syncSenderMetadata,
    scrollToBottom,
  };
}
