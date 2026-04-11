import { useEffect, useMemo, useState } from 'react';
import { Check, Hash, Lock, Trash2, Volume2, X } from 'lucide-react';
import { channelsApi } from '../../api/channelsApi';
import { resolveAssetUrl } from '../../api/httpClient';
import { ChannelType } from '../../types/enums/ChannelType';
import { ServerChannelSettingsResponse } from '../../types/channels/ServerChannelType';
import { ServerChannelResponse, ServerMemberResponse } from '../../types/ServerType';
import Skeleton from '../ui/Skeleton';

interface EditChannelModalProps {
  serverId: string;
  channel: ServerChannelResponse;
  serverMembers: ServerMemberResponse[];
  onClose: () => void;
  onSave: (name: string, isPublic: boolean, memberIds: string[]) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function EditChannelModal({
  serverId,
  channel,
  serverMembers,
  onClose,
  onSave,
  onDelete,
}: EditChannelModalProps) {
  const [settings, setSettings] = useState<ServerChannelSettingsResponse | null>(null);
  const [name, setName] = useState(channel.name);
  const [isPublic, setIsPublic] = useState(channel.isPublic);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const isTextChannel = channel.channelType === ChannelType.Server;

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      setIsSettingsLoading(true);

      try {
        const response = await channelsApi.getServerChannelSettings(serverId, channel.id);

        if (!isMounted) {
          return;
        }

        setSettings(response.data);
        setName(response.data.name);
        setIsPublic(response.data.isPublic);
        setSelectedMemberIds(response.data.memberIds);
      } catch (error) {
        console.error('Не удалось загрузить настройки канала', error);
      } finally {
        if (isMounted) {
          setIsSettingsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [channel.id, serverId]);

  const selectedMembersCount = useMemo(() => {
    const selectedIds = new Set(selectedMemberIds);
    return serverMembers.filter((member) => selectedIds.has(member.userId)).length;
  }, [selectedMemberIds, serverMembers]);

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((currentIds) =>
      currentIds.includes(memberId)
        ? currentIds.filter((id) => id !== memberId)
        : [...currentIds, memberId],
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      await onSave(name.trim(), isPublic, !isPublic ? selectedMemberIds : settings?.memberIds ?? []);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Удалить канал "${channel.name}"? Это действие необратимо.`);

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    try {
      await onDelete();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#2b2d31] p-6 text-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition hover:bg-white/5 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-indigo-300">
            {isTextChannel ? <Hash className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-xl font-bold">Настройки канала</h2>
            <p className="text-sm text-gray-400">
              {isTextChannel ? 'Текстовый канал' : 'Голосовой канал'}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {isSettingsLoading ? (
            <>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="rounded-2xl border border-white/8 bg-[#23252b] px-4 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-1 items-start gap-2.5">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-full rounded-md" />
                      <Skeleton className="h-3 w-4/5 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Название канала</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {isTextChannel ? '#' : '•'}
                  </span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="новый-канал"
                    className="w-full rounded-xl bg-[#1e1f22] py-2.5 pl-8 pr-3 text-sm text-white outline-none ring-1 ring-transparent transition focus:ring-indigo-500/60"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-[#23252b] px-4 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 rounded-lg bg-indigo-500/10 p-2 text-indigo-300">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Приватный канал</div>
                      <p className="mt-1 text-xs leading-5 text-gray-400">
                        После переключения канал будет скрыт для обычных участников. Владелец сервера сохранит доступ автоматически.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPublic((current) => !current)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      !isPublic ? 'bg-indigo-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        !isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {!isPublic && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm text-gray-400">Участники приватного канала</label>
                    <span className="text-xs text-gray-500">{selectedMembersCount} выбрано</span>
                  </div>

                  <div className="max-h-60 space-y-2 overflow-y-auto rounded-2xl border border-white/8 bg-[#23252b] p-2">
                    {serverMembers.map((member) => {
                      const isSelected = selectedMemberIds.includes(member.userId);

                      return (
                        <button
                          key={member.userId}
                          type="button"
                          onClick={() => toggleMember(member.userId)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                            isSelected ? 'bg-indigo-500/15 text-white' : 'text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <img
                            src={resolveAssetUrl(member.avatarUrl)}
                            alt={member.displayName}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">{member.displayName}</div>
                            <div className="truncate text-xs text-gray-500">@{member.username}</div>
                          </div>
                          <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-white/15 text-transparent'
                          }`}>
                            <Check className="h-3 w-3" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Удалить канал
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || isSettingsLoading || !name.trim()}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
