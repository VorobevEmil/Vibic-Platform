import { useCallback, useEffect, useRef, useState } from 'react';
import { messagesApi } from '../../api/messagesApi';
import MessageResponse from '../../types/MessageType';

interface Props {
  serverId?: string;
  channelId: string
}

const NEAR_BOTTOM_THRESHOLD_PX = 160;

export function useChatMessages({ serverId, channelId }: Props) {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [unreadMessageId, setUnreadMessageId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<MessageResponse[]>([]);
  const isNearBottomRef = useRef(true);

  const clearUnreadState = useCallback(() => {
    setUnreadMessageId(null);
    setUnreadCount(0);
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
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    requestAnimationFrame(() => {
      updateBottomState();
    });
  }, [updateBottomState]);

  const initializeMessages = useCallback(async () => {
    clearUnreadState();
    isNearBottomRef.current = true;
    setIsNearBottom(true);
    messagesRef.current = [];
    setMessages([]);
    setCursor(undefined);
    setHasMore(true);

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
      setCursor(response.data.cursor);
      setHasMore(response.data.hasMore);
      setTimeout(() => scrollToBottom('auto'), 10);
    } catch (error) {
      console.log("Ошибка во время инициализации сообщении", error)
    }
  }, [channelId, clearUnreadState, scrollToBottom, serverId]);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;

    const prevScrollHeight = scrollEl.scrollHeight;
    const prevScrollTop = scrollEl.scrollTop;

    setIsLoadingMore(true);

    try {


      let response = null;
      if (serverId) {
        response = await messagesApi.getMessagesByServerIdAndChannelId(serverId!, channelId, cursor);
      }
      else {
        response = await messagesApi.getMessagesByChannelId(channelId, cursor);
      }

      setIsLoadingMore(false);

      const nextMessages = [...response.data.items, ...messagesRef.current];
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
      setCursor(response.data.cursor);
      setHasMore(response.data.hasMore);

      setTimeout(() => {
        scrollEl.scrollTop = scrollEl.scrollHeight - prevScrollHeight + prevScrollTop;
      }, 10);
    } catch (error) {
      console.error('Ошибка при загрузке сообщений:', error);
      setIsLoadingMore(false);
    }
  }, [channelId, cursor, hasMore, isLoadingMore, serverId]);

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
      setTimeout(() => scrollToBottom('smooth'), 10);
      return;
    }

    setUnreadMessageId((currentUnreadMessageId) => currentUnreadMessageId ?? message.id);
    setUnreadCount((currentUnreadCount) => currentUnreadCount + 1);
  }, [clearUnreadState, scrollToBottom]);

  return {
    messages,
    cursor,
    scrollContainerRef,
    messagesEndRef,
    isLoadingMore,
    isNearBottom,
    unreadMessageId,
    unreadCount,
    loadMoreMessages,
    initializeMessages,
    appendIncomingMessage,
    scrollToBottom,
  };
}
