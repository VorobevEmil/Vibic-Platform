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
import { createPortal } from 'react-dom';
import { Copy, Pencil, Reply, Smile, Trash2 } from 'lucide-react';
import { resolveAssetUrl } from '../../../api/httpClient';
import MessageResponse from '../../../types/MessageType';
import { formatMessageTime, formatTimeOnly } from '../../../utils/formatMessageTime';
import { renderContent } from '../../../utils/renderContent';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import EmojiPicker from './EmojiPicker';
import { ReactionBar } from '../ReactionBar';
import UserProfileModal from './UserProfileModal';

const GROUP_TIME_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_GROUPED_ROW_HEIGHT = 48;
const DEFAULT_MESSAGE_ROW_HEIGHT = 84;
const UNREAD_DIVIDER_ESTIMATED_HEIGHT = 40;
const VIRTUAL_OVERSCAN_PX = 720;
const BOTTOM_STICKINESS_THRESHOLD_PX = 220;

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
  isInitializing: boolean;
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
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
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
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
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

function MessageSkeletonRow({
  grouped = false,
  compact = false,
}: {
  grouped?: boolean;
  compact?: boolean;
}) {
  if (grouped) {
    return (
      <div className="flex items-start gap-[14px] px-4 py-1.5">
        <div className="w-8 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className={`h-4 rounded-full bg-white/[0.05] animate-pulse ${compact ? 'w-[34%]' : 'w-[48%]'}`} />
          {!compact && <div className="h-4 w-[78%] rounded-full bg-white/[0.05] animate-pulse" />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-[14px] px-4 py-3">
      <div className="h-8 w-8 shrink-0 rounded-full bg-white/[0.06] animate-pulse" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 rounded-full bg-white/[0.06] animate-pulse" />
          <div className="h-3 w-16 rounded-full bg-white/[0.05] animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-[68%] rounded-full bg-white/[0.05] animate-pulse" />
          <div className="h-4 w-[52%] rounded-full bg-white/[0.05] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function MessageSkeletonList({ mode }: { mode: 'initial' | 'prepend' }) {
  const rows = mode === 'initial'
    ? [false, true, false, true, false, true]
    : [false, true, false];

  return (
    <div
      className={`pointer-events-none ${mode === 'prepend' ? 'mb-2 rounded-2xl border border-white/[0.04] bg-white/[0.02] py-2' : 'py-3'}`}
      aria-hidden="true"
    >
      {rows.map((grouped, index) => (
        <MessageSkeletonRow
          key={`${mode}-${grouped ? 'grouped' : 'full'}-${index}`}
          grouped={grouped}
          compact={mode === 'prepend'}
        />
      ))}
    </div>
  );
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
  onAddReaction,
  onRemoveReaction,
}: MessageRowProps) {
  const editRef = useRef<HTMLTextAreaElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const editCursorRef = useRef(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionPickerPos, setReactionPickerPos] = useState<{ x: number; y: number } | null>(null);
  const reactionBtnRef = useRef<HTMLButtonElement>(null);
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

  const startEdit = useCallback(() => {
    setEditValue(text);
    setEditError(null);
    setShowEditEmojiPicker(false);
    setIsEditing(true);
  }, [text]);

  useEffect(() => {
    const element = rowRef.current;

    if (!element) {
      return;
    }

    const handleStartEdit = () => {
      if (isOwn) {
        startEdit();
      }
    };

    element.addEventListener('vibic:start-edit', handleStartEdit);

    return () => {
      element.removeEventListener('vibic:start-edit', handleStartEdit);
    };
  }, [isOwn, startEdit]);

  const submitEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditError('Сообщение не может быть пустым.');
      return;
    }

    if (trimmed === text) {
      setEditError(null);
      setShowEditEmojiPicker(false);
      setIsEditing(false);
      return;
    }

    const prefix = quote ? `%%REPLY|${quote.id}|${quote.username}|${quote.content}%%\n` : '';
    onEdit?.(message.id, prefix + trimmed);

    setEditError(null);
    setShowEditEmojiPicker(false);
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(); }
    if (e.key === 'Escape') {
      setShowEditEmojiPicker(false);
      setIsEditing(false);
    }
  };

  const syncEditCursor = () => {
    if (!editRef.current) {
      return;
    }

    editCursorRef.current = editRef.current.selectionStart ?? editValue.length;
  };

  const handleEditEmojiButtonClick = () => {
    syncEditCursor();
    setShowEditEmojiPicker((current) => !current);
  };

  const insertEditEmoji = useCallback((emoji: string) => {
    const insertPosition = editCursorRef.current;
    const nextValue = editValue.slice(0, insertPosition) + emoji + editValue.slice(insertPosition);

    setEditValue(nextValue);
    editCursorRef.current = insertPosition + emoji.length;
    setShowEditEmojiPicker(false);

    requestAnimationFrame(() => {
      const textarea = editRef.current;

      if (!textarea) {
        return;
      }

      textarea.focus();
      textarea.setSelectionRange(editCursorRef.current, editCursorRef.current);
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [editValue]);

  const openReactionPicker = () => {
    const rect = reactionBtnRef.current?.getBoundingClientRect();
    if (rect) {
      setReactionPickerPos({ x: rect.right, y: rect.top });
    }
    setShowReactionPicker(v => !v);
  };

  const actions = !isEditing ? (
    <div className={`absolute -top-3 right-2 items-center gap-0.5 bg-[#171b27] border border-white/[0.08] rounded-lg px-1 py-0.5 shadow-xl z-10 ${showReactionPicker ? 'flex' : 'hidden group-hover:flex'}`}>
      {/* Reaction button — portal picker to escape overflow */}
      <button
        ref={reactionBtnRef}
        type="button"
        onClick={openReactionPicker}
        title="Добавить реакцию"
        className={`p-1 rounded transition-colors ${showReactionPicker ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
      >
        <Smile className="w-3.5 h-3.5" />
      </button>
      {isOwn && (
        <>
          <button type="button" onClick={startEdit} title="Редактировать" className="p-1 rounded text-gray-400 hover:text-white transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => onDelete?.(message.id)} title="Удалить" className="p-1 rounded text-gray-400 hover:text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  ) : null;

  const editUI = (
    <div className="relative">
      {showEditEmojiPicker && (
        <EmojiPicker
          onSelect={insertEditEmoji}
          onClose={() => setShowEditEmojiPicker(false)}
        />
      )}
      <div className="mt-1 flex items-end gap-2 rounded-lg border border-indigo-500/40 bg-[#1c2032] px-3 py-2">
        <textarea
          ref={editRef}
          value={editValue}
          onChange={e => {
            setEditValue(e.target.value);
            if (editError) {
              setEditError(null);
            }
          }}
          onKeyDown={handleEditKeyDown}
          onClick={syncEditCursor}
          onKeyUp={syncEditCursor}
          onSelect={syncEditCursor}
          rows={1}
          className="min-h-[24px] flex-1 bg-transparent text-sm text-white outline-none resize-none leading-[1.4]"
        />
        <button
          type="button"
          onClick={handleEditEmojiButtonClick}
          className={`mb-0.5 shrink-0 rounded-lg p-1.5 transition-colors ${showEditEmojiPicker
              ? 'bg-indigo-500/10 text-indigo-400'
              : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          title="Эмодзи"
        >
          <Smile className="h-4 w-4" />
        </button>
      </div>
      {editError && <p className="mt-1 text-[11px] text-red-400">{editError}</p>}
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

  const closeReactionPicker = () => {
    setShowReactionPicker(false);
    setReactionPickerPos(null);
  };

  // Portal-rendered picker — escapes overflow-hidden scroll container
  const reactionPickerPortal = showReactionPicker && reactionPickerPos
    ? createPortal(
      <div
        style={{
          position: 'fixed',
          bottom: `${window.innerHeight - reactionPickerPos.y}px`,
          right: `${window.innerWidth - reactionPickerPos.x}px`,
          zIndex: 200,
        }}
      >
        <EmojiPicker
          onSelect={(emoji) => {
            onAddReaction?.(message.id, emoji);
            closeReactionPicker();
          }}
          onClose={closeReactionPicker}
        />
      </div>,
      document.body
    )
    : null;

  if (isGrouped) {
    return (
      <>
        <div
          ref={rowRef}
          data-message-id={message.id}
          onContextMenu={e => { e.preventDefault(); onContextMenu?.(e, message); }}
          className={`group relative flex flex-col pb-1 px-4 -mx-4 rounded-lg hover:bg-white/[0.03] transition-colors duration-100 ${highlightClass}`}
        >
          {actions}
          {replyReference}
          <div className="flex items-start gap-[14px]">
            <div className="w-8 shrink-0">
              <span className="absolute right-0 top-0.5 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none whitespace-nowrap">
                {formatTimeOnly(message.sentAt)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              {isEditing ? editUI : (
                <div
                  className="text-sm text-gray-300 break-words"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {renderContent(text)}
                  {message.isEdited && <span className="text-[11px] text-gray-500 ml-1">(изменено)</span>}
                </div>
              )}
              <ReactionBar
                message={message}
                currentUserId={currentUserId}
                onAddReaction={(msgId, emoji) => onAddReaction?.(msgId, emoji)}
                onRemoveReaction={(msgId, emoji) => onRemoveReaction?.(msgId, emoji)}
              />
            </div>
          </div>
        </div>
        {reactionPickerPortal}
      </>
    );
  }

  return (
    <>
      <div
        ref={rowRef}
        data-message-id={message.id}
        onContextMenu={e => { e.preventDefault(); onContextMenu?.(e, message); }}
        className={`group relative flex flex-col px-[18px] pt-2 pb-3 -mx-4 rounded-lg hover:bg-white/[0.03] transition-colors duration-100 ${highlightClass}`}
      >
        {actions}
        {replyReference}
        <div className="flex items-start gap-[14px]">
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
              >
                {renderContent(text)}
                {message.isEdited && <span className="text-[11px] text-gray-500 ml-1">(изменено)</span>}
              </div>
            )}
            <ReactionBar
              message={message}
              currentUserId={currentUserId}
              onAddReaction={(msgId, emoji) => onAddReaction?.(msgId, emoji)}
              onRemoveReaction={(msgId, emoji) => onRemoveReaction?.(msgId, emoji)}
            />
          </div>
        </div>
      </div>
      {reactionPickerPortal}
    </>
  );
}

// ── ChatMessages ─────────────────────────────────────────────────────────────
const ChatMessages = forwardRef<ChatMessagesRef, ChatMessageProps>(function ChatMessages(
  {
    messages,
    isInitializing,
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
    onAddReaction,
    onRemoveReaction,
  },
  ref,
) {
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [virtualViewport, setVirtualViewport] = useState({ scrollTop: 0, height: 0 });
  const [measureVersion, setMeasureVersion] = useState(0);
  const rowHeightsRef = useRef<Record<string, number>>({});
  const virtualItemsRef = useRef<VirtualMessageItem[]>([]);
  const offsetsRef = useRef<number[]>([]);
  const pendingScrollAdjustmentRef = useRef(0);
  const pendingStickToBottomRef = useRef(false);
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
    void measureVersion;

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
  virtualItemsRef.current = virtualItems;
  offsetsRef.current = offsets;

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

    const currentVirtualItems = virtualItemsRef.current;
    const currentOffsets = offsetsRef.current;
    const itemIndex = currentVirtualItems.findIndex((item) => item.key === rowKey);
    const item = itemIndex >= 0 ? currentVirtualItems[itemIndex] : null;
    const previousHeight = rowHeightsRef.current[rowKey] ?? item?.estimatedHeight;

    if (previousHeight === height) {
      return;
    }

    const heightDelta = previousHeight === undefined ? 0 : height - previousHeight;
    const scrollElement = scrollContainerRef.current;

    if (scrollElement && item && heightDelta !== 0) {
      const distanceFromBottom = scrollElement.scrollHeight
        - scrollElement.scrollTop
        - scrollElement.clientHeight;
      const isNearBottom = distanceFromBottom <= BOTTOM_STICKINESS_THRESHOLD_PX;
      const itemTop = currentOffsets[itemIndex] ?? 0;
      const itemBottom = itemTop + previousHeight;

      if (isNearBottom) {
        pendingStickToBottomRef.current = true;
      } else if (itemBottom <= scrollElement.scrollTop) {
        pendingScrollAdjustmentRef.current += heightDelta;
      }
    }

    rowHeightsRef.current[rowKey] = height;
    setMeasureVersion((currentVersion) => currentVersion + 1);
  }, [scrollContainerRef]);

  useLayoutEffect(() => {
    const scrollElement = scrollContainerRef.current;

    if (!scrollElement) {
      return;
    }

    const pendingAdjustment = pendingScrollAdjustmentRef.current;
    const shouldStickToBottom = pendingStickToBottomRef.current;

    if (pendingAdjustment === 0 && !shouldStickToBottom) {
      return;
    }

    pendingScrollAdjustmentRef.current = 0;
    pendingStickToBottomRef.current = false;

    if (shouldStickToBottom) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
      return;
    }

    scrollElement.scrollTop += pendingAdjustment;
  }, [measureVersion, scrollContainerRef]);

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
      items.push({ label: '---', onClick: () => { } });
      items.push({
        label: 'Редактировать',
        icon: <Pencil className="w-4 h-4" />,
        onClick: () => {
          const el = document.querySelector(`[data-message-id="${msg.id}"]`);
          if (el instanceof HTMLElement) {
            el.dispatchEvent(new Event('vibic:start-edit'));
          }
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
      {isInitializing && messages.length === 0 ? (
        <MessageSkeletonList mode="initial" />
      ) : (
        <>
          {isLoadingMore && messages.length > 0 && (
            <MessageSkeletonList mode="prepend" />
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
                      onAddReaction={onAddReaction}
                      onRemoveReaction={onRemoveReaction}
                    />
                  </MeasuredMessageItem>
                ))}
              </div>
            )}
          </div>
        </>
      )}

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
