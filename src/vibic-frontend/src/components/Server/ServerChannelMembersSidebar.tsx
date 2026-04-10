import { useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Lock, Users } from 'lucide-react';
import { resolveAssetUrl } from '../../api/httpClient';
import { channelsApi } from '../../api/channelsApi';
import { useAuthContext } from '../../context/AuthContext';
import { createPresenceHubConnection } from '../../services/signalRClient';
import { ServerChannelParticipantResponse } from '../../types/channels/ServerChannelType';
import { getUserStatusOption } from '../../utils/userStatus';
import UserProfileModal from '../Chat/DirectChat/UserProfileModal';
import Skeleton from '../ui/Skeleton';

interface Props {
  serverId: string;
  serverName: string;
  channelId: string;
  channelName: string;
  isPublic: boolean;
}

interface UserStatusSnapshot {
  userId: string;
  userStatus: number;
}

function isPresentStatus(userStatus: number | null): boolean {
  return userStatus !== null && userStatus !== 4;
}

function getStatusRank(userStatus: number | null): number {
  switch (userStatus) {
    case 1:
      return 0;
    case 2:
      return 1;
    case 3:
      return 2;
    case 5:
      return 3;
    case 4:
      return 4;
    default:
      return 5;
  }
}

export default function ServerChannelMembersSidebar({
  serverId,
  serverName,
  channelId,
  channelName,
  isPublic,
}: Props) {
  const { selfUser } = useAuthContext();
  const [participants, setParticipants] = useState<ServerChannelParticipantResponse[]>([]);
  const [statusesById, setStatusesById] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const participantIdsRef = useRef<string[]>([]);
  const [profileModal, setProfileModal] = useState<{
    userId: string;
    username: string;
    avatarUrl: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!selfUser) {
      return;
    }

    setStatusesById((currentStatuses) => ({
      ...currentStatuses,
      [selfUser.id]: selfUser.userStatus,
    }));
  }, [selfUser?.id, selfUser?.userStatus]);

  useEffect(() => {
    let isCancelled = false;
    const connection = createPresenceHubConnection();

    const applyStatusSnapshots = (snapshots: UserStatusSnapshot[]) => {
      if (snapshots.length === 0) {
        return;
      }

      setStatusesById((currentStatuses) => {
        const nextStatuses = { ...currentStatuses };

        snapshots.forEach((snapshot) => {
          nextStatuses[snapshot.userId] = snapshot.userStatus;
        });

        return nextStatuses;
      });
    };

    const syncStatuses = async () => {
      if (participantIdsRef.current.length === 0) {
        return;
      }

      try {
        const snapshots = await connection.invoke<UserStatusSnapshot[]>(
          'GetUserStatuses',
          participantIdsRef.current
        );

        if (!isCancelled) {
          applyStatusSnapshots(snapshots);
        }
      } catch (error) {
        if (!isCancelled) {
          console.warn('Не удалось синхронизировать статусы участников канала', error);
        }
      }
    };

    const handleStatusChanged = (userId: string, userStatus: number) => {
      if (!participantIdsRef.current.includes(userId)) {
        return;
      }

      setStatusesById((currentStatuses) => ({
        ...currentStatuses,
        [userId]: userStatus,
      }));
    };

    connection.on('UserStatusChanged', handleStatusChanged);
    connection.onreconnected(() => {
      void syncStatuses();
    });

    const initializeSidebar = async () => {
      setIsLoading(true);
      setHasLoadError(false);

      try {
        const response = await channelsApi.getServerChannelMembers(serverId, channelId);

        if (isCancelled) {
          return;
        }

        participantIdsRef.current = response.data.map((participant) => participant.userId);
        setParticipants(response.data);

        await connection.start();

        if (isCancelled) {
          return;
        }

        await syncStatuses();
      } catch (error) {
        if (!isCancelled) {
          console.error('Ошибка при загрузке участников канала:', error);
          setHasLoadError(true);
          setParticipants([]);
          participantIdsRef.current = [];
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void initializeSidebar();

    return () => {
      isCancelled = true;
      participantIdsRef.current = [];
      connection.off('UserStatusChanged', handleStatusChanged);
      void connection.stop();
    };
  }, [channelId, serverId]);

  const enrichedParticipants = useMemo(() => {
    return [...participants]
      .map((participant) => {
        const isSelf = selfUser?.id === participant.userId;

        return {
          ...participant,
          displayName: isSelf ? selfUser.displayName : participant.displayName,
          username: isSelf ? selfUser.username : participant.username,
          avatarUrl: isSelf ? selfUser.avatarUrl : participant.avatarUrl,
          userStatus: isSelf
            ? statusesById[participant.userId] ?? selfUser.userStatus
            : statusesById[participant.userId] ?? null,
        };
      })
      .sort((leftParticipant, rightParticipant) => {
        const rankDifference = getStatusRank(leftParticipant.userStatus) - getStatusRank(rightParticipant.userStatus);

        if (rankDifference !== 0) {
          return rankDifference;
        }

        return leftParticipant.displayName.localeCompare(rightParticipant.displayName);
      });
  }, [participants, selfUser, statusesById]);

  const onlineParticipants = enrichedParticipants.filter((participant) => isPresentStatus(participant.userStatus));
  const offlineParticipants = enrichedParticipants.filter((participant) => !isPresentStatus(participant.userStatus));

  const renderLoadingGroup = (count: number) => (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded-md" />
        <Skeleton className="h-3 w-6 rounded-md" />
      </div>

      <div className="space-y-2.5">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/8 bg-[#202228] px-3 py-3"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderParticipants = (title: string, items: typeof enrichedParticipants) => {
    if (items.length === 0) {
      return null;
    }

    return (
      <section>
        <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
          <span>{title}</span>
          <span>{items.length}</span>
        </div>

        <div className="space-y-2.5">
          {items.map((participant) => {
            const statusOption = participant.userStatus === null
              ? null
              : getUserStatusOption(participant.userStatus);

            return (
              <div
                key={participant.userId}
                onClick={(e) => setProfileModal({
                  userId: participant.userId,
                  username: participant.username,
                  avatarUrl: participant.avatarUrl ?? '',
                  x: e.clientX + 12,
                  y: e.clientY - 20,
                })}
                className="rounded-2xl border border-white/8 bg-[#202228] px-3 py-3 transition cursor-pointer hover:border-white/20 hover:bg-[#2a2d35]"
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0 group/avatar">
                    <img
                      src={resolveAssetUrl(participant.avatarUrl)}
                      alt={participant.displayName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <Circle
                      className={`absolute bottom-0 right-0 h-3.5 w-3.5 fill-current ring-2 ring-[#202228] rounded-full ${
                        statusOption?.badgeClassName ?? 'text-gray-500'
                      }`}
                    />
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 rounded-lg bg-[#111214] px-2.5 py-1.5 text-xs text-white shadow-lg whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                      {statusOption?.label ?? 'Статус обновляется'}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold text-white">{participant.displayName}</div>
                      {selfUser?.id === participant.userId && (
                        <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200">
                          Ты
                        </span>
                      )}
                    </div>

                    <div className="truncate text-xs text-gray-400">@{participant.username}</div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <aside className="w-[300px] shrink-0 overflow-y-auto border-l border-t border-gray-700 bg-[#2b2d31] px-4 py-5 relative">
      <div className="mb-5 rounded-2xl border border-white/8 bg-[#23252b] px-4 py-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <Users className="h-4 w-4 text-sky-300" />
          Участники канала
        </div>
        <div className="truncate text-sm font-medium text-gray-200">#{channelName}</div>
        <div className="mt-1 truncate text-xs text-gray-400">{serverName}</div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          {!isPublic && <Lock className="h-3.5 w-3.5 text-amber-300" />}
          <span>{isPublic ? 'Публичный канал' : 'Приватный канал'}</span>
        </div>
        {isLoading ? (
          <div className="mt-2">
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        ) : (
          <div className="mt-2 text-xs text-gray-400">
            {onlineParticipants.length} онлайн из {enrichedParticipants.length}
          </div>
        )}
      </div>

      {hasLoadError ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-4 text-sm text-red-100">
          Не удалось загрузить участников этого канала.
        </div>
      ) : isLoading ? (
        <div className="space-y-5">
          {renderLoadingGroup(3)}
          {renderLoadingGroup(2)}
        </div>
      ) : (
        <div className="space-y-5">
          {renderParticipants('Сейчас в сети', onlineParticipants)}
          {renderParticipants('Остальные', offlineParticipants)}
        </div>
      )}

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
    </aside>
  );
}
