import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { resolveAssetUrl } from '../../../api/httpClient';
import MessageResponse from '../../../types/MessageType';

const ESTIMATED_MESSAGE_HEIGHT = 88;
const MIN_MESSAGE_HEIGHT = 64;
const OVERSCAN_PX = 600;
const UNREAD_MARKER_HEIGHT = 44;

interface ChatMessageProps {
  messages: MessageResponse[];
  typingUsername: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isLoadingMore: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  unreadMessageId: string | null;
  unreadCount: number;
}

interface MessageRowProps {
  message: MessageResponse;
  onHeightChange: (messageId: string, height: number) => void;
}

function upperBound(values: number[], target: number): number {
  let low = 0;
  let high = values.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);

    if (values[mid] <= target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

function MessageRow({ message, onHeightChange }: MessageRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const node = rowRef.current;

    if (!node) {
      return;
    }

    const measure = () => {
      onHeightChange(message.id, node.getBoundingClientRect().height);
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, [message.id, onHeightChange]);

  return (
    <div ref={rowRef} className="group flex items-start gap-3 pb-4 px-4 -mx-4 rounded-md hover:bg-white/[0.04] transition-colors">
      <img
        src={resolveAssetUrl(message.senderAvatarUrl)}
        className="w-8 h-8 rounded-full mt-0.5 shrink-0"
        alt={message.senderUsername}
        loading="lazy"
      />
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white">
          {message.senderUsername}
          <span className="text-xs text-gray-400 ml-2">
            {new Date(message.sentAt).toLocaleString()}
          </span>
        </div>
        <div
          className="text-sm text-gray-300 mt-1 whitespace-pre-line break-words"
          style={{ overflowWrap: 'anywhere' }}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

export default function ChatMessages({
  messages,
  typingUsername,
  messagesEndRef,
  isLoadingMore,
  scrollContainerRef,
  unreadMessageId,
  unreadCount,
}: ChatMessageProps) {
  const heightCacheRef = useRef<Record<string, number>>({});
  const [heightVersion, setHeightVersion] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const unreadMarkerIndex = unreadMessageId
    ? messages.findIndex((message) => message.id === unreadMessageId)
    : -1;

  const handleHeightChange = useCallback((messageId: string, height: number) => {
    const normalizedHeight = Math.max(MIN_MESSAGE_HEIGHT, Math.ceil(height));
    const currentHeight = heightCacheRef.current[messageId];

    if (currentHeight !== undefined && Math.abs(currentHeight - normalizedHeight) <= 1) {
      return;
    }

    heightCacheRef.current[messageId] = normalizedHeight;
    setHeightVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const messageIds = new Set(messages.map((message) => message.id));
    let cacheChanged = false;

    Object.keys(heightCacheRef.current).forEach((messageId) => {
      if (!messageIds.has(messageId)) {
        delete heightCacheRef.current[messageId];
        cacheChanged = true;
      }
    });

    if (cacheChanged) {
      setHeightVersion((version) => version + 1);
    }
  }, [messages]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    let frameId: number | null = null;

    const updateScrollMetrics = () => {
      setScrollTop(scrollContainer.scrollTop);
      setViewportHeight(scrollContainer.clientHeight);
    };

    const handleScroll = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        setScrollTop(scrollContainer.scrollTop);
      });
    };

    updateScrollMetrics();

    const resizeObserver = new ResizeObserver(updateScrollMetrics);
    resizeObserver.observe(scrollContainer);

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollMetrics);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollMetrics);
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainerRef]);

  const { offsets, totalHeight } = useMemo(() => {
    const nextOffsets = new Array<number>(messages.length + 1);
    nextOffsets[0] = 0;

    for (let index = 0; index < messages.length; index += 1) {
      const message = messages[index];
      const messageHeight = heightCacheRef.current[message.id] ?? ESTIMATED_MESSAGE_HEIGHT;
      const unreadMarkerHeight = index === unreadMarkerIndex ? UNREAD_MARKER_HEIGHT : 0;
      nextOffsets[index + 1] = nextOffsets[index] + unreadMarkerHeight + messageHeight;
    }

    return {
      offsets: nextOffsets,
      totalHeight: nextOffsets[messages.length] ?? 0,
    };
  }, [heightVersion, messages, unreadMarkerIndex]);

  const startIndex = useMemo(() => {
    if (messages.length === 0) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(
        messages.length - 1,
        upperBound(offsets, Math.max(0, scrollTop - OVERSCAN_PX)) - 1,
      ),
    );
  }, [messages.length, offsets, scrollTop]);

  const endIndex = useMemo(() => {
    if (messages.length === 0) {
      return -1;
    }

    return Math.max(
      startIndex,
      Math.min(
        messages.length - 1,
        upperBound(offsets, scrollTop + viewportHeight + OVERSCAN_PX) - 1,
      ),
    );
  }, [messages.length, offsets, scrollTop, startIndex, viewportHeight]);

  const visibleMessages = endIndex >= startIndex
    ? messages.slice(startIndex, endIndex + 1)
    : [];

  const topPadding = offsets[startIndex] ?? 0;
  const bottomPadding = Math.max(0, totalHeight - (offsets[endIndex + 1] ?? 0));

  return (
    <>
      {isLoadingMore && (
        <div className="text-sm text-gray-400 text-center animate-pulse pb-3">Загрузка сообщений...</div>
      )}

      {topPadding > 0 && <div style={{ height: topPadding }} aria-hidden="true" />}

      {visibleMessages.map((message) => (
        <div key={message.id}>
          {message.id === unreadMessageId && unreadCount > 0 && (
            <div className="flex items-center gap-3 pb-3" style={{ height: UNREAD_MARKER_HEIGHT }}>
              <div className="h-px flex-1 bg-sky-500/60" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300">
                New messages
              </span>
              <div className="h-px flex-1 bg-sky-500/60" />
            </div>
          )}

          <MessageRow
            message={message}
            onHeightChange={handleHeightChange}
          />
        </div>
      ))}

      {bottomPadding > 0 && <div style={{ height: bottomPadding }} aria-hidden="true" />}

      {typingUsername && (
        <div className="text-sm text-gray-400 mt-2 ml-2 animate-pulse">
          {typingUsername} печатает...
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  );
}
