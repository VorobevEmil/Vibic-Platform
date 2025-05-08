import { useState, useRef } from 'react';
import { messagesApi } from '../../api/messagesApi';
import MessageResponse from '../../types/MessageType';

interface Props {
  serverId?: string;
  channelId: string
}

export function useChatMessages({ serverId, channelId }: Props) {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeMessages = async () => {

    try {

      let response = null;
      if (serverId) {
        response = await messagesApi.getMessagesByServerIdAndChannelId(serverId, channelId);
      }
      else {
        response = await messagesApi.getMessagesByChannelId(channelId);
      }
      setMessages(response.data.items);
      setCursor(response.data.cursor);
      setHasMore(response.data.hasMore);
      setTimeout(scrollToBottom, 10);
    } catch (error) {
      console.log("Ошибка во время инициализации сообщении", error)
    }
  };

  const loadMoreMessages = async () => {
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

      setMessages(prev => [...response.data.items, ...prev]);
      setCursor(response.data.cursor);
      setHasMore(response.data.hasMore);

      setTimeout(() => {
        scrollEl.scrollTop = scrollEl.scrollHeight - prevScrollHeight + prevScrollTop;
      }, 10);
    } catch (error) {

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