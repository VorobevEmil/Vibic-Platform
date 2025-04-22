import { useState, useEffect, useRef } from 'react';
import { messagesApi } from '../../api/messagesApi';
import MessageType from '../../types/MessageType';

export function useChatMessages(channelId: string) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeMessages = async () => {
    const response = await messagesApi.getMessagesByChannelId(channelId);
    if (response.status === 200) {
      setMessages(response.data.items);
      setCursor(response.data.cursor);
      setHasMore(response.data.hasMore);
      setTimeout(scrollToBottom, 10);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMore) return;
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;

    const prevScrollHeight = scrollEl.scrollHeight;
    const prevScrollTop = scrollEl.scrollTop;

    setIsLoadingMore(true);
    const response = await messagesApi.getMessagesByChannelId(channelId, cursor);
    setIsLoadingMore(false);

    if (response.status === 200) {
      setMessages(prev => [...response.data.items, ...prev]);
      setCursor(response.data.cursor);
      setHasMore(response.data.hasMore);

      setTimeout(() => {
        scrollEl.scrollTop = scrollEl.scrollHeight - prevScrollHeight + prevScrollTop;
      }, 10);
    }
  };

  return {
    messages,
    setMessages,
    cursor,
    scrollContainerRef,
    messagesEndRef,
    isLoadingMore,
    loadMoreMessages,
    initializeMessages,
    scrollToBottom,
  };
}