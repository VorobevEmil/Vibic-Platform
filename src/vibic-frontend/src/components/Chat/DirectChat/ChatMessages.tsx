import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Copy, Pencil, Reply, Trash2 } from 'lucide-react';
import { resolveAssetUrl } from '../../../api/httpClient';
import MessageResponse from '../../../types/MessageType';
import { formatMessageTime, formatTimeOnly } from '../../../utils/formatMessageTime';
import { renderContent } from '../../../utils/renderContent';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import UserProfileModal from './UserProfileModal';

const GROUP_TIME_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_GROUPED_ROW_HEIGHT = 48;
const DEFAULT_MESSAGE_ROW_HEIGHT = 84;
const UNREAD_DIVIDER_ESTIMATED_HEIGHT = 40;
const VIRTUAL_OVERSCAN_PX = 720;

// ── Формат цитаты в контенте сообщения ──────────────────────────────────────
// %%REPLY|{id}|{username}|{content}%%\n{text}
const REPLY_RE = /^%%REPLY\|([^|]+)\|([^|]+)\|([^%]*)%%\n?/;

interface ParsedMessage {
  text: string;
  quote: { id: string; username: string; content: string } | null;
}

function parseMessageContent(raw: string): ParsedMessage {
  const match = raw.match(REPLY_RE);
  if (!match) return { text: raw, quote: null };
  const [full, id, username, content] = match;
  return { text: raw.slice(full.length), quote: { id, username, content } };
}

// ── Интерфейс ref ────────────────────────────────────────────────────────────
export interface ChatMessagesRef {
  scrollToMessage: (messageId: string) => void;
}

// ── Props ────────────────────────────────────────────────────────────────────
interface ChatMessageProps {
  messages: MessageResponse[];
  typingUsername: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  isLoadingMore: boolean;
  unreadMessageId: string | null;
  unreadCount: number;
  currentUserId?: string;
  serverId?: string;
  onDeleteMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onReply?: (message: MessageResponse) => void;
}

interface QuotedSenderInfo {
  senderId: string;
  avatarUrl: string;
}

interface MessageRowProps {
  message: MessageResponse;
  isGrouped: boolean;
  isHighlighted: boolean;
  currentUserId?: string;
  senderInfoByUsername?: Map<string, QuotedSenderInfo>;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onContextMenu?: (e: React.MouseEvent, message: MessageResponse) => void;
  onAvatarClick?: (e: React.MouseEvent, message: MessageResponse) => void;
  onQuoteUserClick?: (e: React.MouseEvent, senderId: string, username: string, avatarUrl: string) => void;
  onScrollToMessage?: (messageId: string) => void;
}

interface VirtualMessageItem {
  key: string;
  message: MessageResponse;
  isGrouped: boolean;
  showUnreadDivider: boolean;
  estimatedHeight: number;
}

interface MeasuredMessageItemProps {
  rowKey: string;
  messageId: string;
  onHeightChange: (rowKey: string, height: number) => void;
  onRowRefChange: (messageId: string, element: HTMLDivElement | null) => void;
  children: React.ReactNode;
}

function estimateRowHeight(message: MessageResponse, isGrouped: boolean, showUnreadDivider: boolean): number {
  const { text, quote } = parseMessageContent(message.content);
  const imageCount = (message.content.match(/%%IMG\|/g) ?? []).length;
  const textLineEstimate = Math.max(1, Math.ceil(text.length / 52));

  let estimatedHeight = isGrouped ? DEFAULT_GROUPED_ROW_HEIGHT : DEFAULT_MESSAGE_ROW_HEIGHT;
  estimatedHeight += Math.min(textLineEstimate, 12) * 18;

  if (quote) {
    estimatedHeight += 34;
  }

  if (imageCount > 0) {
    estimatedHeight += imageCount * 220;
  }

  if (showUnreadDivider) {
    estimatedHeight += UNREAD_DIVIDER_ESTIMATED_HEIGHT;
  }

  return estimatedHeight;
}

function findItemIndexByOffset(offsets: number[], targetOffset: number): number {
  const lastItemIndex = offsets.length - 2;

  if (lastItemIndex < 0) {
    return 0;
  }

  let low = 0;
  let high = lastItemIndex;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const itemStart = offsets[middle];
    const itemEnd = offsets[middle + 1];

    if (targetOffset < itemStart) {
      high = middle - 1;
      continue;
    }

    if (targetOffset >= itemEnd) {
      low = middle + 1;
      continue;
    }

    return middle;
  }

  return Math.max(0, Math.min(lastItemIndex, low));
}

function MeasuredMessageItem({
  rowKey,
  messageId,
  onHeightChange,
  onRowRefChange,
  children,
}: MeasuredMessageItemProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    onRowRefChange(messageId, element);

    const measure = () => {
      onHeightChange(rowKey, Math.ceil(element.getBoundingClientRect().height));
    };

    measure();

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
      onRowRefChange(messageId, null);
    };
  }, [messageId, onHeightChange, onRowRefChange, rowKey]);

  return <div ref={containerRef}>{children}</div>;
}

// ── MessageRow ───────────────────────────────────────────────────────────────
function MessageRow({
  message,
  isGrouped,
  isHighlighted,
  currentUserId,
  senderInfoByUsername,
  onDelete,
  onEdit,
  onContextMenu,
  onAvatarClick,
  onQuoteUserClick,
  onScrollToMessage,
}: MessageRowProps) {
  const editRef = useRef<HTMLTextAreaElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const isOwn = currentUserId === message.senderId;
  const { text, quote } = parseMessageContent(message.content);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      const len = editRef.current.value.length;
      editRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.style.height = 'auto';
      editRef.current.style.height = `${editRef.current.scrollHeight}px`;
    }
  }, [editValue, isEditing]);

  const startEdit = () => {
    setEditValue(text);
    setIsEditing(true);
  };

  const submitEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== text) {
      // Сохраняем цитату в контенте если она была
      const prefix = quote ? `%%REPLY|${quote.id}|${quote.username}|${quote.content}%%\n` : '';
      onEdit?.(message.id, prefix + trimmed);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(); }
    if (e.key === 'Escape') setIsEditing(false);
  };

  const actions = isOwn && !isEditing ? (
    <div className="absolute -top-3 right-2 hidden group-hover:flex items-center gap-0.5 bg-[#2b2d31] border border-white/10 rounded-lg px-1 py-0.5 shadow-lg z-10">
      <button type="button" onClick={startEdit} title="Редактировать" className="p-1 rounded text-gray-400 hover:text-white transition-colors">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => onDelete?.(message.id)} title="Удалить" className="p-1 rounded text-gray-400 hover:text-red-400 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  ) : null;

  const editUI = (
    <div>
      <textarea
        ref={editRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onKeyDown={handleEditKeyDown}
        rows={1}
        className="w-full bg-[#383a40] text-sm text-white rounded-lg px-3 py-2 outline-none resize-none leading-[1.4] border border-indigo-500/50 mt-1"
      />
      <p className="text-[11px] text-gray-500 mt-1">Enter — сохранить · Esc — отмена</p>
    </div>
  );

  const highlightClass = isHighlighted ? 'message-highlight' : '';

  // Блок цитаты в стиле Discord — над строкой сообщения
  const quotedSender = quote ? senderInfoByUsername?.get(quote.username) : undefined;

  const replyReference = quote ? (
    <div className="flex items-end gap-1.5 mb-0.5 max-w-full min-w-0 group/quote">
      {/* Изогнутый коннектор */}
      <div className="shrink-0 w-[38px] h-[14px] rounded-tl-[6px] border-l-2 border-t-2 border-white/20 group-hover/quote:border-white/35 transition-colors" />
      {/* Кликабельная часть: аватарка + имя + превью — скролл к сообщению */}
      <button
        type="button"
        onClick={() => onScrollToMessage?.(quote.id)}
        className="flex items-center gap-1.5 min-w-0 text-left"
      >
        {/* Мини-аватар */}
        {quotedSender?.avatarUrl ? (
          <img
            src={resolveAssetUrl(quotedSender.avatarUrl)}
            className="shrink-0 w-4 h-4 rounded-full object-cover"
            alt={quote.username}
          />
        ) : (
          <div className="shrink-0 w-4 h-4 rounded-full bg-indigo-500/40 flex items-center justify-center text-[9px] font-bold text-indigo-200 uppercase">
            {quote.username.charAt(0)}
          </div>
        )}
        {/* Имя — отдельная кнопка для открытия карточки */}
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            if (quotedSender) {
              onQuoteUserClick?.(e, quotedSender.senderId, quote.username, quotedSender.avatarUrl);
            }
          }}
          className="shrink-0 text-xs font-medium text-gray-300 hover:text-white hover:underline transition-colors max-w-[120px] truncate cursor-pointer"
        >
          @{quote.username}
        </span>
        {/* Превью текста */}
        <span className="text-xs text-gray-500 group-hover/quote:text-gray-300 transition-colors truncate min-w-0">
          {quote.content}
        </span>
      </button>
    </div>
  ) : null;

  if (isGrouped) {
    return (
      <div
        data-message-id={message.id}
        onContextMenu={e => { e.preventDefault(); onContextMenu?.(e, message); }}
        className={`group relative flex flex-col pb-1 px-4 -mx-4 rounded-md hover:bg-white/[0.04] transition-colors ${highlightClass}`}
      >
        {actions}
        {replyReference}
        <div className="flex items-start gap-3">
          <div className="w-8 shrink-0 relative">
            <span className="absolute right-0 top-0.5 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none whitespace-nowrap">
              {formatTimeOnly(message.sentAt)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            {isEditing ? editUI : (
              <div
                className="text-sm text-gray-300 break-words"
                style={{ overflowWrap: 'anywhere' }}
                onDoubleClick={isOwn ? startEdit : undefined}
              >
                {renderContent(text)}
                {message.isEdited && <span className="text-[11px] text-gray-500 ml-1">(изменено)</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-message-id={message.id}
      onContextMenu={e => { e.preventDefault(); onContextMenu?.(e, message); }}
      className={`group relative flex flex-col pb-4 px-4 -mx-4 rounded-md hover:bg-white/[0.04] transition-colors ${highlightClass}`}
    >
      {actions}
      {replyReference}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={e => onAvatarClick?.(e, message)}
          className="shrink-0 mt-0.5 rounded-full focus:outline-none"
        >
          <img
            src={resolveAssetUrl(message.senderAvatarUrl)}
            className="w-8 h-8 rounded-full hover:brightness-110 transition-[filter] cursor-pointer"
            alt={message.senderUsername}
            loading="lazy"
          />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">
            <button
              type="button"
              onClick={e => onAvatarClick?.(e, message)}
              className="text-white hover:underline cursor-pointer focus:outline-none"
            >
              {message.senderUsername}
            </button>
            <span className="text-xs text-gray-400 ml-2">{formatMessageTime(message.sentAt)}</span>
          </div>
          {isEditing ? editUI : (
            <div
              className="text-sm text-gray-300 mt-1 break-words"
              style={{ overflowWrap: 'anywhere' }}
              onDoubleClick={isOwn ? startEdit : undefined}
            >
              {renderContent(text)}
              {message.isEdited && <span className="text-[11px] text-gray-500 ml-1">(изменено)</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ChatMessages ─────────────────────────────────────────────────────────────
const ChatMessages = forwardRef<ChatMessagesRef, ChatMessageProps>(function ChatMessages(
  {
    messages,
    typingUsername,
    messagesEndRef,
    scrollContainerRef,
    isLoadingMore,
    unreadMessageId,
    unreadCount,
    currentUserId,
    serverId,
    onDeleteMessage,
    onEditMessage,
    onReply,
  },
  ref,
) {
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [virtualViewport, setVirtualViewport] = useState({ scrollTop: 0, height: 0 });
  const [measureVersion, setMeasureVersion] = useState(0);
  const rowHeightsRef = useRef<Record<string, number>>({});
  const rowElementsRef = useRef(new Map<string, HTMLDivElement>());
  const highlightStartTimeoutRef = useRef<number | null>(null);
  const highlightEndTimeoutRef = useRef<number | null>(null);

  // Контекстное меню
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: MessageResponse;
  } | null>(null);

  // Профиль пользователя
  const [profileModal, setProfileModal] = useState<{
    x: number;
    y: number;
    userId: string;
    username: string;
    avatarUrl: string;
  } | null>(null);

  // Маппинг username → { senderId, avatarUrl } для цитат
  const senderInfoByUsername = useMemo(() => {
    const map = new Map<string, QuotedSenderInfo>();
    messages.forEach(m => {
      if (!map.has(m.senderUsername)) {
        map.set(m.senderUsername, { senderId: m.senderId, avatarUrl: m.senderAvatarUrl });
      }
    });
    return map;
  }, [messages]);

  const groupedFlags = useMemo<boolean[]>(() => {
    return messages.map((msg, i) => {
      if (i === 0) return false;
      // Сообщения с цитатой всегда показываются полностью
      if (REPLY_RE.test(msg.content)) return false;
      const prev = messages[i - 1];
      if (prev.senderId !== msg.senderId) return false;
      return new Date(msg.sentAt).getTime() - new Date(prev.sentAt).getTime() <= GROUP_TIME_WINDOW_MS;
    });
  }, [messages]);

  useEffect(() => {
    const scrollElement = scrollContainerRef.current;

    if (!scrollElement) {
      return;
    }

    let frameId = 0;

    const syncViewport = () => {
      frameId = 0;
      const nextViewport = {
        scrollTop: scrollElement.scrollTop,
        height: scrollElement.clientHeight,
      };

      setVirtualViewport((currentViewport) => {
        if (
          currentViewport.scrollTop === nextViewport.scrollTop &&
          currentViewport.height === nextViewport.height
        ) {
          return currentViewport;
        }

        return nextViewport;
      });
    };

    const requestViewportSync = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = requestAnimationFrame(syncViewport);
    };

    requestViewportSync();

    const resizeObserver = new ResizeObserver(() => {
      requestViewportSync();
    });

    resizeObserver.observe(scrollElement);
    scrollElement.addEventListener('scroll', requestViewportSync, { passive: true });

    return () => {
      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }

      resizeObserver.disconnect();
      scrollElement.removeEventListener('scroll', requestViewportSync);
    };
  }, [scrollContainerRef]);

  useEffect(() => {
    return () => {
      if (highlightStartTimeoutRef.current !== null) {
        window.clearTimeout(highlightStartTimeoutRef.current);
      }

      if (highlightEndTimeoutRef.current !== null) {
        window.clearTimeout(highlightEndTimeoutRef.current);
      }
    };
  }, []);

  const virtualItems = useMemo<VirtualMessageItem[]>(() => {
    return messages.map((message, index) => {
      const isGrouped = groupedFlags[index] ?? false;
      const showUnreadDivider = message.id === unreadMessageId && unreadCount > 0;

      return {
        key: `${message.id}:${isGrouped ? 'g' : 'f'}:${showUnreadDivider ? 'u' : 'n'}`,
        message,
        isGrouped,
        showUnreadDivider,
        estimatedHeight: estimateRowHeight(message, isGrouped, showUnreadDivider),
      };
    });
  }, [groupedFlags, messages, unreadCount, unreadMessageId]);

  const offsets = useMemo<number[]>(() => {
    const nextOffsets = new Array<number>(virtualItems.length + 1);
    nextOffsets[0] = 0;

    for (let index = 0; index < virtualItems.length; index += 1) {
      const item = virtualItems[index];
      const measuredHeight = rowHeightsRef.current[item.key] ?? item.estimatedHeight;

      nextOffsets[index + 1] = nextOffsets[index] + measuredHeight;
    }

    return nextOffsets;
  }, [measureVersion, virtualItems]);

  const totalHeight = offsets[virtualItems.length] ?? 0;

  const visibleRange = useMemo(() => {
    if (virtualItems.length === 0) {
      return { startIndex: 0, endIndex: -1 };
    }

    const visibleStartOffset = Math.max(0, virtualViewport.scrollTop - VIRTUAL_OVERSCAN_PX);
    const visibleEndOffset = virtualViewport.scrollTop + virtualViewport.height + VIRTUAL_OVERSCAN_PX;

    const startIndex = findItemIndexByOffset(offsets, visibleStartOffset);
    const endIndex = Math.min(
      virtualItems.length - 1,
      findItemIndexByOffset(offsets, visibleEndOffset),
    );

    return { startIndex, endIndex };
  }, [offsets, virtualItems.length, virtualViewport.height, virtualViewport.scrollTop]);

  const visibleItems = visibleRange.endIndex >= visibleRange.startIndex
    ? virtualItems.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
    : [];

  const topSpacerHeight = offsets[visibleRange.startIndex] ?? 0;

  const handleRowHeightChange = useCallback((rowKey: string, height: number) => {
    if (height <= 0) {
      return;
    }

    const previousHeight = rowHeightsRef.current[rowKey];

    if (previousHeight === height) {
      return;
    }

    rowHeightsRef.current[rowKey] = height;
    setMeasureVersion((currentVersion) => currentVersion + 1);
  }, []);

  const handleRowRefChange = useCallback((messageId: string, element: HTMLDivElement | null) => {
    if (element) {
      rowElementsRef.current.set(messageId, element);
      return;
    }

    rowElementsRef.current.delete(messageId);
  }, []);

  // ── scrollToMessage (через ref) ──────────────────────────────────────────
  const handleScrollToMessage = useCallback((messageId: string) => {
    const targetIndex = virtualItems.findIndex((item) => item.message.id === messageId);

    if (targetIndex === -1) {
      return;
    }

    const scrollElement = scrollContainerRef.current;
    const itemTop = offsets[targetIndex] ?? 0;
    const targetItem = virtualItems[targetIndex];
    const itemHeight = rowHeightsRef.current[targetItem.key] ?? targetItem.estimatedHeight;

    if (scrollElement) {
      const centeredTop = Math.max(0, itemTop - (scrollElement.clientHeight - itemHeight) / 2);
      scrollElement.scrollTo({ top: centeredTop, behavior: 'smooth' });
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const element = rowElementsRef.current.get(messageId)
          ?? document.querySelector(`[data-message-id="${messageId}"]`);

        if (element instanceof HTMLElement) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });

    if (highlightStartTimeoutRef.current !== null) {
      window.clearTimeout(highlightStartTimeoutRef.current);
    }

    if (highlightEndTimeoutRef.current !== null) {
      window.clearTimeout(highlightEndTimeoutRef.current);
    }

    highlightStartTimeoutRef.current = window.setTimeout(() => {
      setHighlightedMessageId(messageId);
    }, 250);

    highlightEndTimeoutRef.current = window.setTimeout(() => {
      setHighlightedMessageId(null);
    }, 2250);
  }, [offsets, scrollContainerRef, virtualItems]);

  useImperativeHandle(ref, () => ({
    scrollToMessage: handleScrollToMessage,
  }), [handleScrollToMessage]);

  // ── Context menu builder ─────────────────────────────────────────────────
  const buildMenuItems = useCallback((msg: MessageResponse): ContextMenuItem[] => {
    const isOwn = currentUserId === msg.senderId;
    const { text } = parseMessageContent(msg.content);
    const items: ContextMenuItem[] = [
      {
        label: 'Ответить',
        icon: <Reply className="w-4 h-4" />,
        onClick: () => onReply?.(msg),
      },
      {
        label: 'Копировать текст',
        icon: <Copy className="w-4 h-4" />,
        onClick: () => void navigator.clipboard.writeText(text),
      },
    ];
    if (isOwn) {
      items.push({ label: '---', onClick: () => {} });
      items.push({
        label: 'Редактировать',
        icon: <Pencil className="w-4 h-4" />,
        onClick: () => {
          const el = document.querySelector(`[data-message-id="${msg.id}"]`);
          if (el) (el as HTMLElement).dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        },
      });
      items.push({
        label: 'Удалить',
        icon: <Trash2 className="w-4 h-4" />,
        variant: 'danger',
        onClick: () => onDeleteMessage?.(msg.id),
      });
    }
    return items;
  }, [currentUserId, onDeleteMessage, onReply]);

  return (
    <>
      {isLoadingMore && (
        <div className="text-sm text-gray-400 text-center animate-pulse pb-3">Загрузка сообщений...</div>
      )}

      <div
        className="relative"
        style={{ height: totalHeight > 0 ? totalHeight : undefined, minHeight: totalHeight > 0 ? totalHeight : undefined }}
      >
        {visibleItems.length > 0 && (
          <div
            className="absolute inset-x-0 top-0"
            style={{ transform: `translateY(${topSpacerHeight}px)` }}
          >
            {visibleItems.map((item) => (
              <MeasuredMessageItem
                key={item.key}
                rowKey={item.key}
                messageId={item.message.id}
                onHeightChange={handleRowHeightChange}
                onRowRefChange={handleRowRefChange}
              >
                {item.showUnreadDivider && (
                  <div className="flex items-center gap-3 pb-3">
                    <div className="h-px flex-1 bg-sky-500/60" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300">
                      Новые сообщения
                    </span>
                    <div className="h-px flex-1 bg-sky-500/60" />
                  </div>
                )}
                <MessageRow
                  message={item.message}
                  isGrouped={item.isGrouped}
                  isHighlighted={highlightedMessageId === item.message.id}
                  currentUserId={currentUserId}
                  senderInfoByUsername={senderInfoByUsername}
                  onDelete={onDeleteMessage}
                  onEdit={onEditMessage}
                  onContextMenu={(e, m) => setContextMenu({ x: e.clientX, y: e.clientY, message: m })}
                  onAvatarClick={(e, m) => setProfileModal({ x: e.clientX + 12, y: e.clientY - 20, userId: m.senderId, username: m.senderUsername, avatarUrl: m.senderAvatarUrl })}
                  onQuoteUserClick={(e, senderId, username, avatarUrl) => setProfileModal({ x: e.clientX + 12, y: e.clientY - 20, userId: senderId, username, avatarUrl })}
                  onScrollToMessage={handleScrollToMessage}
                />
              </MeasuredMessageItem>
            ))}
          </div>
        )}
      </div>

      {typingUsername && (
        <div className="flex items-center gap-1.5 text-xs ml-3 mt-1 mb-2">
          <span className="text-gray-300 font-medium">{typingUsername}</span>
          <span className="text-gray-500">печатает</span>
          <div className="flex items-center gap-0.5 ml-0.5">
            {[0, 1, 2].map(i => (
              <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {/* Контекстное меню */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={buildMenuItems(contextMenu.message)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Профиль пользователя */}
      {profileModal && (
        <UserProfileModal
          userId={profileModal.userId}
          username={profileModal.username}
          avatarUrl={profileModal.avatarUrl}
          anchorX={profileModal.x}
          anchorY={profileModal.y}
          serverId={serverId}
          onClose={() => setProfileModal(null)}
        />
      )}
    </>
  );
});

export default ChatMessages;
