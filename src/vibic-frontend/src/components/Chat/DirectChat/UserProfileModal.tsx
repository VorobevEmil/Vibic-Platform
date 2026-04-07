import { useEffect, useRef, useState } from 'react';
import { Circle, MoreHorizontal, Send, UserMinus, UserPlus, Clock, ChevronRight } from 'lucide-react';
import { resolveAssetUrl } from '../../../api/httpClient';
import { userProfilesApi } from '../../../api/userProfilesApi';
import { friendsApi } from '../../../api/friendsApi';
import { invitesApi } from '../../../api/invitesApi';
import { useAuthContext } from '../../../context/AuthContext';
import UserProfileResponse from '../../../types/UserProfileType';
import { getUserStatusOption } from '../../../utils/userStatus';

interface UserProfileModalProps {
  userId: string;
  username: string;
  avatarUrl: string;
  anchorX: number;
  anchorY: number;
  serverId?: string;
  onClose: () => void;
}

type FriendStatus = 'loading' | 'self' | 'none' | 'request_sent' | 'friends';

export default function UserProfileModal({
  userId,
  username,
  avatarUrl,
  anchorX,
  anchorY,
  serverId,
  onClose,
}: UserProfileModalProps) {
  const { selfUser } = useAuthContext();
  const modalRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('loading');
  const [messageText, setMessageText] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  // Invite sub-state
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);

  const isSelf = selfUser?.id === userId;

  useEffect(() => {
    userProfilesApi.getById(userId).then(r => setProfile(r.data)).catch(() => {});

    if (isSelf) {
      setFriendStatus('self');
      return;
    }

    Promise.all([
      friendsApi.getFriends(),
      friendsApi.getOutgoing(),
    ]).then(([friendsRes, outgoingRes]) => {
      const isFriend = friendsRes.data.some(f => f.id === userId);
      if (isFriend) { setFriendStatus('friends'); return; }
      const hasPending = outgoingRes.data.some(r => r.userProfile.id === userId);
      setFriendStatus(hasPending ? 'request_sent' : 'none');
    }).catch(() => setFriendStatus('none'));
  }, [userId, isSelf]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleAddFriend = async () => {
    setFriendStatus('request_sent');
    try {
      await friendsApi.sendFriendRequest(userId);
    } catch {
      setFriendStatus('none');
    }
  };

  const handleRemoveFriend = async () => {
    setFriendStatus('none');
    setConfirmRemove(false);
    try {
      await friendsApi.removeFriend(userId);
    } catch {
      setFriendStatus('friends');
    }
  };

  const handleInviteToServer = async () => {
    if (!serverId) return;
    setShowInvitePanel(true);
    setShowMoreMenu(false);
    if (!inviteUrl) {
      try {
        const res = await invitesApi.createInvite(serverId);
        setInviteUrl(`${window.location.origin}/invite/${res.data.code}`);
      } catch {
        setInviteUrl('');
      }
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl).catch(() => {});
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 1500);
  };

  const MODAL_W = 288;
  const MODAL_H = 380;
  const left = Math.min(anchorX, window.innerWidth - MODAL_W - 8);
  const top = Math.min(Math.max(anchorY - 20, 8), window.innerHeight - MODAL_H - 8);

  const displayName = profile?.displayName ?? username;
  const bio = profile?.bio;
  const statusOption = profile ? getUserStatusOption(profile.userStatus) : null;

  return (
    <div
      ref={modalRef}
      style={{ position: 'fixed', left, top, zIndex: 9999, width: MODAL_W }}
      className="bg-[#1e1f23] border border-white/10 rounded-2xl shadow-2xl overflow-visible"
    >
      {/* Баннер + шапка действий */}
      <div className="relative h-16 bg-gradient-to-br from-indigo-700/80 to-violet-700/60 rounded-t-2xl">
        {/* Кнопки действий в правом верхнем углу */}
        {!isSelf && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {/* Добавить/удалить друга */}
            {friendStatus === 'none' && (
              <button
                type="button"
                title="Добавить в друзья"
                onClick={handleAddFriend}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 hover:bg-indigo-500/70 text-white transition-colors"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            )}
            {friendStatus === 'request_sent' && (
              <button
                type="button"
                title="Запрос отправлен"
                disabled
                className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 text-gray-400 cursor-default"
              >
                <Clock className="h-4 w-4" />
              </button>
            )}
            {friendStatus === 'friends' && !confirmRemove && (
              <button
                type="button"
                title="Удалить из друзей"
                onClick={() => setConfirmRemove(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 hover:bg-red-500/70 text-white transition-colors"
              >
                <UserMinus className="h-4 w-4" />
              </button>
            )}

            {/* Ещё */}
            <div ref={moreRef} className="relative">
              <button
                type="button"
                title="Ещё"
                onClick={() => { setShowMoreMenu(v => !v); setShowInvitePanel(false); }}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 hover:bg-white/20 text-white transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-[#111214] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[10000]">
                  <button
                    type="button"
                    onClick={() => setShowMoreMenu(false)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                  >
                    Полный профиль
                  </button>

                  {serverId && (
                    <button
                      type="button"
                      onClick={handleInviteToServer}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors flex items-center justify-between"
                    >
                      Пригласить на сервер
                      <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                  )}

                  <div className="border-t border-white/10 my-1" />

                  <button
                    type="button"
                    onClick={() => setShowMoreMenu(false)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                  >
                    Игнорировать
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMoreMenu(false)}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                  >
                    Заблокировать
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMoreMenu(false)}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                  >
                    Пожаловаться
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        {/* Аватар + статус */}
        <div className="relative -mt-8 mb-3 w-fit">
          <img
            src={resolveAssetUrl(profile?.avatarUrl ?? avatarUrl)}
            alt={displayName}
            className="w-16 h-16 rounded-full border-4 border-[#1e1f23] object-cover"
          />
          {statusOption && (
            <Circle
              className={`absolute bottom-1 right-0.5 h-4 w-4 fill-current ring-2 ring-[#1e1f23] rounded-full ${statusOption.badgeClassName}`}
            />
          )}
        </div>

        {/* Подтверждение удаления из друзей */}
        {confirmRemove && (
          <div className="mb-3 rounded-xl bg-red-500/10 border border-red-400/20 px-3 py-2.5">
            <p className="text-xs text-red-200 mb-2">Удалить {displayName} из друзей?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRemoveFriend}
                className="flex-1 text-xs bg-red-500/80 hover:bg-red-500 text-white rounded-lg py-1.5 transition-colors"
              >
                Удалить
              </button>
              <button
                type="button"
                onClick={() => setConfirmRemove(false)}
                className="flex-1 text-xs bg-white/10 hover:bg-white/15 text-gray-200 rounded-lg py-1.5 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Имя + статус-строка */}
        <div className="mb-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-white text-base leading-tight">{displayName}</p>
            {isSelf && (
              <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200">
                Ты
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">@{profile?.username ?? username}</p>
        </div>

        {statusOption && (
          <div className="flex items-center gap-1.5 mb-3">
            <Circle className={`h-2.5 w-2.5 fill-current shrink-0 ${statusOption.badgeClassName}`} />
            <span className="text-xs text-gray-300">{statusOption.label}</span>
          </div>
        )}

        {/* Bio */}
        {bio && (
          <div className="mb-3 border-t border-white/10 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">О себе</p>
            <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{bio}</p>
          </div>
        )}

        {/* Инвайт-панель */}
        {showInvitePanel && (
          <div className="mb-3 border-t border-white/10 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Ссылка-приглашение</p>
            <div className="flex items-center gap-2 bg-[#2b2d31] rounded-xl px-3 py-2">
              <span className="flex-1 text-xs text-gray-300 truncate min-w-0">
                {inviteUrl === null ? 'Генерируем...' : inviteUrl || 'Ошибка'}
              </span>
              <button
                type="button"
                onClick={handleCopyInvite}
                disabled={!inviteUrl}
                className="text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-40 shrink-0 transition-colors"
              >
                {inviteCopied ? 'Скопировано!' : 'Копировать'}
              </button>
            </div>
          </div>
        )}

        {/* Написать сообщение */}
        {!isSelf && (
          <div className={`border-t border-white/10 pt-3 ${!bio && !showInvitePanel ? 'mt-1' : ''}`}>
            <div className="flex items-center gap-2 bg-[#2b2d31] rounded-xl px-3 py-2">
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder={`Написать @${profile?.username ?? username}`}
                className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none min-w-0"
              />
              <button
                type="button"
                disabled={!messageText.trim()}
                className="text-gray-500 hover:text-indigo-400 disabled:opacity-30 transition-colors shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
