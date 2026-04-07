import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
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

const ESTIMATED_MESSAGE_HEIGHT = 88;
const ESTIMATED_GROUPED_MESSAGE_HEIGHT = 44;
const MIN_MESSAGE_HEIGHT = 64;
const OVERSCAN_PX = 600;
const UNREAD_MARKER_HEIGHT = 44;
const GROUP_TIME_WINDOW_MS = 5 * 60 * 1000;

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
  isLoadingMore: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
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
  onHeightChange: (messageId: string, height: number) => void;
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

// ── Хелпер бинарного поиска ──────────────────────────────────────────────────
function upperBound(values: number[], target: number): number {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (values[mid] <= target) low = mid + 1;
    else high = mid;
  }
  return low;
}

// ── MessageRow ───────────────────────────────────────────────────────────────
function MessageRow({
  message,
  onHeightChange,
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
  const rowRef = useRef<HTMLDivElement | null>(null);
  const editRef = useRef<HTMLTextAreaElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const isOwn = currentUserId === message.senderId;
  const { text, quote } = parseMessageContent(message.content);

  useLayoutEffect(() => {
    const node = rowRef.current;
    if (!node) return;
    const measure = () => onHeightChange(message.id, node.getBoundingClientRect().height);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [message.id, onHeightChange]);

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
        ref={rowRef}
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
      ref={rowRef}
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
    isLoadingMore,
    scrollContainerRef,
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
  const heightCacheRef = useRef<Record<string, number>>({});
  const [heightVersion, setHeightVersion] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

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

  const unreadMarkerIndex = unreadMessageId
    ? messages.findIndex(m => m.id === unreadMessageId)
    : -1;

  const handleHeightChange = useCallback((messageId: string, height: number) => {
    const normalized = Math.max(MIN_MESSAGE_HEIGHT, Math.ceil(height));
    const current = heightCacheRef.current[messageId];
    if (current !== undefined && Math.abs(current - normalized) <= 1) return;
    heightCacheRef.current[messageId] = normalized;
    setHeightVersion(v => v + 1);
  }, []);

  useEffect(() => {
    const ids = new Set(messages.map(m => m.id));
    let changed = false;
    Object.keys(heightCacheRef.current).forEach(id => {
      if (!ids.has(id)) { delete heightCacheRef.current[id]; changed = true; }
    });
    if (changed) setHeightVersion(v => v + 1);
  }, [messages]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    let frameId: number | null = null;
    const update = () => { setScrollTop(el.scrollTop); setViewportHeight(el.clientHeight); };
    const onScroll = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => setScrollTop(el.scrollTop));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      ro.disconnect();
      window.removeEventListener('resize', update);
      el.removeEventListener('scroll', onScroll);
    };
  }, [scrollContainerRef]);

  const groupedFlags = useMemo<boolean[]>(() => {
    return messages.map((msg, i) => {
      if (i === 0 || i === unreadMarkerIndex) return false;
      // Сообщения с цитатой всегда показываются полностью
      if (REPLY_RE.test(msg.content)) return false;
      const prev = messages[i - 1];
      if (prev.senderId !== msg.senderId) return false;
      return new Date(msg.sentAt).getTime() - new Date(prev.sentAt).getTime() <= GROUP_TIME_WINDOW_MS;
    });
  }, [messages, unreadMarkerIndex]);

  const { offsets, totalHeight } = useMemo(() => {
    const next = new Array<number>(messages.length + 1);
    next[0] = 0;
    for (let i = 0; i < messages.length; i++) {
      const estimated = groupedFlags[i] ? ESTIMATED_GROUPED_MESSAGE_HEIGHT : ESTIMATED_MESSAGE_HEIGHT;
      const h = heightCacheRef.current[messages[i].id] ?? estimated;
      const marker = i === unreadMarkerIndex ? UNREAD_MARKER_HEIGHT : 0;
      next[i + 1] = next[i] + marker + h;
    }
    return { offsets: next, totalHeight: next[messages.length] ?? 0 };
  }, [heightVersion, messages, unreadMarkerIndex, groupedFlags]);

  const startIndex = useMemo(() => {
    if (!messages.length) return 0;
    return Math.max(0, Math.min(messages.length - 1, upperBound(offsets, Math.max(0, scrollTop - OVERSCAN_PX)) - 1));
  }, [messages.length, offsets, scrollTop]);

  const endIndex = useMemo(() => {
    if (!messages.length) return -1;
    return Math.max(startIndex, Math.min(messages.length - 1, upperBound(offsets, scrollTop + viewportHeight + OVERSCAN_PX) - 1));
  }, [messages.length, offsets, scrollTop, startIndex, viewportHeight]);

  // ── scrollToMessage (через ref) ──────────────────────────────────────────
  const handleScrollToMessage = useCallback((messageId: string) => {
    const index = messages.findIndex(m => m.id === messageId);
    if (index < 0) return;
    const targetOffset = offsets[index] ?? 0;
    scrollContainerRef.current?.scrollTo({ top: targetOffset, behavior: 'smooth' });
    setTimeout(() => setHighlightedMessageId(messageId), 350);
    setTimeout(() => setHighlightedMessageId(null), 2350);
  }, [messages, offsets, scrollContainerRef]);

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
          // Запускаем inline edit через двойной клик — здесь просто триггер
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

  const visibleMessages = endIndex >= startIndex ? messages.slice(startIndex, endIndex + 1) : [];
  const topPadding = offsets[startIndex] ?? 0;
  const bottomPadding = Math.max(0, totalHeight - (offsets[endIndex + 1] ?? 0));

  return (
    <>
      {isLoadingMore && (
        <div className="text-sm text-gray-400 text-center animate-pulse pb-3">Загрузка сообщений...</div>
      )}

      {topPadding > 0 && <div style={{ height: topPadding }} aria-hidden="true" />}

      {visibleMessages.map((msg, localIndex) => {
        const absoluteIndex = startIndex + localIndex;
        const isGrouped = groupedFlags[absoluteIndex] ?? false;
        return (
          <div key={msg.id}>
            {msg.id === unreadMessageId && unreadCount > 0 && (
              <div className="flex items-center gap-3 pb-3" style={{ height: UNREAD_MARKER_HEIGHT }}>
                <div className="h-px flex-1 bg-sky-500/60" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300">
                  Новые сообщения
                </span>
                <div className="h-px flex-1 bg-sky-500/60" />
              </div>
            )}
            <MessageRow
              message={msg}
              onHeightChange={handleHeightChange}
              isGrouped={isGrouped}
              isHighlighted={highlightedMessageId === msg.id}
              currentUserId={currentUserId}
              senderInfoByUsername={senderInfoByUsername}
              onDelete={onDeleteMessage}
              onEdit={onEditMessage}
              onContextMenu={(e, m) => setContextMenu({ x: e.clientX, y: e.clientY, message: m })}
              onAvatarClick={(e, m) => setProfileModal({ x: e.clientX + 12, y: e.clientY - 20, userId: m.senderId, username: m.senderUsername, avatarUrl: m.senderAvatarUrl })}
              onQuoteUserClick={(e, senderId, username, avatarUrl) => setProfileModal({ x: e.clientX + 12, y: e.clientY - 20, userId: senderId, username, avatarUrl })}
              onScrollToMessage={handleScrollToMessage}
            />
          </div>
        );
      })}

      {bottomPadding > 0 && <div style={{ height: bottomPadding }} aria-hidden="true" />}

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
