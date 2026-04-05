import { useEffect, useRef, useState } from 'react';
import { Camera, LoaderCircle, LogOut, Shield, UserRound, X } from 'lucide-react';
import AvatarUploadModal from './AvatarUploadModal';
import { useAuthContext } from '../../context/AuthContext';
import { userProfilesApi } from '../../api/userProfilesApi';
import { resolveAssetUrl } from '../../api/httpClient';
import { presenceHubConnection } from '../../services/signalRClient';
import {
  PREFERRED_USER_STATUS_STORAGE_KEY,
  USER_STATUS_OPTIONS,
} from '../../utils/userStatus';

interface Props {
  onClose: () => void;
}

export default function UserSettingsModal({ onClose }: Props) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { selfUser, updateSelfUser, logout } = useAuthContext();
  const [username, setUsername] = useState(selfUser?.username ?? '');
  const [bio, setBio] = useState(selfUser?.bio ?? '');
  const [selectedStatus, setSelectedStatus] = useState(selfUser?.userStatus ?? 1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!selfUser) {
    return null;
  }

  const handleAvatarSave = async (file: File | null) => {
    if (!file) {
      return;
    }

    try {
      const response = await userProfilesApi.updateAvatar(file);
      updateSelfUser({
        ...selfUser,
        avatarUrl: response.data.url,
      });
      setIsAvatarModalOpen(false);
    } catch (avatarError) {
      console.error('Ошибка при обновлении аватара:', avatarError);
      setError('Не удалось обновить аватар. Попробуй еще раз.');
    }
  };

  const handleSave = async () => {
    const trimmedUsername = username.trim();
    const trimmedBio = bio.trim();

    if (!trimmedUsername) {
      setError('Username не должен быть пустым.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await userProfilesApi.updateProfile({
        username: trimmedUsername,
        avatarUri: selfUser.avatarUrl ?? null,
        bio: trimmedBio || null,
      });

      if (presenceHubConnection.state === 'Connected') {
        await presenceHubConnection.invoke('UpdateStatus', selectedStatus);
      } else {
        await userProfilesApi.updateStatus(selectedStatus);
      }

      localStorage.setItem(PREFERRED_USER_STATUS_STORAGE_KEY, String(selectedStatus));

      updateSelfUser({
        ...selfUser,
        username: trimmedUsername,
        bio: trimmedBio || null,
        userStatus: selectedStatus,
      });

      onClose();
    } catch (saveError) {
      console.error('Ошибка при обновлении профиля:', saveError);
      setError('Не удалось сохранить настройки профиля. Проверь данные и попробуй снова.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#1c1d22] text-white shadow-2xl"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 z-10 rounded-full bg-white/5 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Закрыть настройки"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid gap-0 md:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.24),_transparent_52%),linear-gradient(180deg,#20232a_0%,#18191d_100%)] p-6 md:border-b-0 md:border-r">
              <div className="mb-8">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
                  <Shield className="h-3.5 w-3.5" />
                  User Settings
                </div>
                <h2 className="text-2xl font-semibold">Профиль и присутствие</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Управляй тем, как тебя видят другие пользователи: аккаунт, био, статус и аватар.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="relative mx-auto mb-4 h-24 w-24">
                  <img
                    src={resolveAssetUrl(selfUser.avatarUrl)}
                    alt={selfUser.username}
                    className="h-24 w-24 rounded-full border-4 border-white/10 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="absolute -bottom-1 -right-1 rounded-full border border-sky-400/40 bg-[#101115] p-2 text-sky-200 transition hover:border-sky-300/70 hover:text-white"
                    title="Изменить аватар"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-center">
                  <div className="text-lg font-semibold">{selfUser.displayName}</div>
                  <div className="mt-1 text-sm text-gray-400">@{username || selfUser.username}</div>
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-1 text-xs uppercase tracking-[0.18em] text-gray-400">Display name</div>
                  <div className="text-sm text-gray-200">{selfUser.displayName}</div>
                  <div className="mt-2 text-xs text-gray-500">
                    Пока отображаемое имя задаётся при регистрации и ещё не вынесено в отдельный backend flow.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void logout()}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100 transition hover:border-red-400/50 hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  Выйти из аккаунта
                </button>
              </div>
            </aside>

            <section className="p-6 md:p-8">
              <div className="space-y-8">
                <div>
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-200">
                    <UserRound className="h-4 w-4 text-sky-300" />
                    Основная информация
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm text-gray-300">Username</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#121319] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50"
                        placeholder="username"
                      />
                      <span className="mt-2 block text-xs text-gray-500">
                        Используется для поиска и идентификации пользователя.
                      </span>
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm text-gray-300">Bio</span>
                      <textarea
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        rows={4}
                        className="w-full resize-none rounded-xl border border-white/10 bg-[#121319] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50"
                        placeholder="Расскажи пару слов о себе"
                      />
                      <span className="mt-2 block text-xs text-gray-500">
                        Короткое описание профиля показывается в карточках и настройках.
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="mb-4 text-sm font-semibold text-gray-200">Статус</div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {USER_STATUS_OPTIONS.map((statusOption) => {
                      const isSelected = selectedStatus === statusOption.value;

                      return (
                        <button
                          key={statusOption.value}
                          type="button"
                          onClick={() => setSelectedStatus(statusOption.value)}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                            isSelected
                              ? `${statusOption.accentClassName} shadow-[0_0_0_1px_rgba(255,255,255,0.04)]`
                              : 'border-white/10 bg-[#121319] text-gray-200 hover:border-white/20 hover:bg-[#171922]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold">{statusOption.label}</span>
                            <span className={`text-xs ${statusOption.badgeClassName}`}>●</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            {statusOption.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-gray-500">
                    Изменения применяются к текущему профилю сразу после сохранения.
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                      Сохранить изменения
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {isAvatarModalOpen && (
        <AvatarUploadModal
          currentAvatar={resolveAssetUrl(selfUser.avatarUrl)}
          onClose={() => setIsAvatarModalOpen(false)}
          onSave={(file) => {
            void handleAvatarSave(file);
          }}
        />
      )}
    </>
  );
}
