import { useCallback, useEffect, useRef, useState } from 'react';
import { messagesApi } from '../../api/messagesApi';
import { reactionsApi } from '../../api/reactionsApi';
import MessageResponse from '../../types/MessageType';

interface Props {
  serverId?: string;
  channelId: string
}

const NEAR_BOTTOM_THRESHOLD_PX = 220;

export function useChatMessages({ serverId, channelId }: Props) {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
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
  const prependRestoreRef = useRef<{ previousScrollHeight: number; previousScrollTop: number } | null>(null);

  const clearUnreadState = useCallback(() => {
    setUnreadMessageId(null);
    setUnreadCount(0);
  }, []);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await reactionsApi.addReaction(messageId, emoji);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }, []);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await reactionsApi.removeReaction(messageId, emoji);
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
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

  const restorePrependScrollPosition = useCallback(() => {
    const pendingRestore = prependRestoreRef.current;
    const scrollEl = scrollContainerRef.current;

    if (!pendingRestore || !scrollEl) {
      return;
    }

    let remainingFrames = 2;

    const applyRestore = () => {
      const nextScrollTop = scrollEl.scrollHeight
        - pendingRestore.previousScrollHeight
        + pendingRestore.previousScrollTop;

      scrollEl.scrollTo({
        top: nextScrollTop,
        behavior: 'auto',
      });

      remainingFrames -= 1;

      if (remainingFrames > 0) {
        requestAnimationFrame(applyRestore);
        return;
      }

      prependRestoreRef.current = null;
      updateBottomState();
    };

    requestAnimationFrame(applyRestore);
  }, [updateBottomState]);

  const initializeMessages = useCallback(async () => {
    setIsInitializing(true);
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
    } finally {
      setIsInitializing(false);
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
      prependRestoreRef.current = {
        previousScrollHeight: prevScrollHeight,
        previousScrollTop: prevScrollTop,
      };
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
      cursorRef.current = response.data.cursor;
      hasMoreRef.current = response.data.hasMore;
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
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

  useEffect(() => {
    if (!prependRestoreRef.current) {
      return;
    }

    restorePrependScrollPosition();
  }, [messages, restorePrependScrollPosition]);

  const deleteMessageById = useCallback((messageId: string) => {
    const next = messagesRef.current.filter(m => m.id !== messageId);
    messagesRef.current = next;
    setMessages(next);
  }, []);

  const replaceMessage = useCallback((updatedMessage: MessageResponse) => {
    const next = messagesRef.current.map(m =>
      m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m
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
    isInitializing,
    isLoadingMore,
    isNearBottom,
    unreadMessageId,
    unreadCount,
    scrollContainerRef,
    messagesEndRef,
    messagesRef,
    loadMoreMessages,
    initializeMessages,
    appendIncomingMessage,
    deleteMessageById,
    replaceMessage,
    syncSenderMetadata,
    scrollToBottom,
    addReaction,
    removeReaction,
  };
}
