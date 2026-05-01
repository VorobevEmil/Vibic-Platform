import { Link, useParams } from 'react-router-dom';
import { ServerChannelResponse, ServerMemberResponse } from '../../types/ServerType';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ChevronDown,
    Hash,
    Volume2,
    UserPlus,
    MicOff,
    Settings,
    Ellipsis,
    Pencil,
    Trash2,
    Plus,
} from 'lucide-react';
import { channelsApi } from '../../api/channelsApi';
import CreateChannelModal from './CreateChannelModal';
import { ServerChannelRequest } from '../../types/channels/ServerChannelType';
import InviteModal from './InviteModal';
import EditServerModal from './EditServerModal';
import EditChannelModal from './EditChannelModal';
import { ChannelType } from '../../types/enums/ChannelType';
import { useVoice } from '../../context/VoiceContext';
import { resolveAssetUrl } from '../../api/httpClient';
import Skeleton from '../ui/Skeleton';
import ContextMenu, { ContextMenuItem } from '../Chat/DirectChat/ContextMenu';

interface ServerChannelListSidebarProps {
    serverName: string;
    serverId: string;
    serverIconUrl?: string | null;
    isOwner: boolean;
    channels: ServerChannelResponse[];
    serverMembers: ServerMemberResponse[];
    isLoading?: boolean;
    onChannelCreated: (channel: ServerChannelResponse) => void;
    onChannelUpdated: (channel: ServerChannelResponse) => void;
    onChannelDeleted: (channelId: string) => Promise<void>;
    onServerUpdated: (name: string, iconFile: File | null) => Promise<void>;
    onServerDeleted: () => Promise<void>;
}

export default function ServerChannelListSidebar({
    serverName,
    serverId,
    serverIconUrl,
    isOwner,
    channels,
    serverMembers,
    isLoading = false,
    onChannelCreated,
    onChannelUpdated,
    onChannelDeleted,
    onServerUpdated,
    onServerDeleted,
}: ServerChannelListSidebarProps) {
    const { channelId } = useParams<{ channelId: string }>();

    const [textOpen, setTextOpen] = useState(true);
    const [voiceOpen, setVoiceOpen] = useState(true);
    const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);

    const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
    const [createChannelType, setCreateChannelType] = useState<ChannelType>(ChannelType.Server);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditServerModalOpen, setIsEditServerModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState<ServerChannelResponse | null>(null);
    const [channelContextMenu, setChannelContextMenu] = useState<{
        x: number;
        y: number;
        channel: ServerChannelResponse;
    } | null>(null);
    const { joinChannel, voiceUsers, voiceUsersByChannel, currentChannelId, activeVoiceSession } = useVoice();
    const serverMenuRef = useRef<HTMLDivElement | null>(null);

    const textChannels = channels?.filter((c) => c.channelType === ChannelType.Server);
    const voiceChannels = channels?.filter((c) => c.channelType === ChannelType.Voice);
    const showChannelSkeleton = isLoading && channels.length === 0;

    const createServer = async (request: ServerChannelRequest) => {
        try {
            const response = await channelsApi.createServerChannel(serverId, request);
            onChannelCreated(response.data);
        } catch (err) {
            console.error('Ошибка при создании канала', err);
            throw err;
        }
    };

    useEffect(() => {
        if (!isServerMenuOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (!serverMenuRef.current?.contains(event.target as Node)) {
                setIsServerMenuOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsServerMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isServerMenuOpen]);

    const openCreateChannelModal = (channelType: ChannelType = ChannelType.Server) => {
        setIsServerMenuOpen(false);
        setCreateChannelType(channelType);
        setIsCreateChannelModalOpen(true);
    };

    const openInviteModal = () => {
        setIsServerMenuOpen(false);
        setIsInviteModalOpen(true);
    };

    const openEditServerModal = () => {
        setIsServerMenuOpen(false);
        setIsEditServerModalOpen(true);
    };

    const openChannelContextMenu = (
        event: Pick<MouseEvent, 'clientX' | 'clientY'> | Pick<React.MouseEvent, 'clientX' | 'clientY'>,
        channel: ServerChannelResponse,
    ) => {
        if (!isOwner) {
            return;
        }

        setChannelContextMenu({
            x: event.clientX,
            y: event.clientY,
            channel,
        });
    };

    const openChannelContextMenuFromButton = (
        event: React.MouseEvent<HTMLButtonElement>,
        channel: ServerChannelResponse,
    ) => {
        event.preventDefault();
        event.stopPropagation();

        const rect = event.currentTarget.getBoundingClientRect();
        openChannelContextMenu(
            {
                clientX: rect.right - 8,
                clientY: rect.bottom + 8,
            },
            channel,
        );
    };

    const channelMenuItems = useMemo<ContextMenuItem[]>(() => {
        if (!channelContextMenu || !isOwner) {
            return [];
        }

        return [
            {
                label: 'Редактировать канал',
                icon: <Pencil className="h-4 w-4" />,
                onClick: () => setEditingChannel(channelContextMenu.channel),
            },
            {
                label: 'Удалить канал',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: async () => {
                    const confirmed = window.confirm(`Удалить канал "${channelContextMenu.channel.name}"? Это действие необратимо.`);

                    if (!confirmed) {
                        return;
                    }

                    await onChannelDeleted(channelContextMenu.channel.id);
                },
                variant: 'danger',
            },
        ];
    }, [channelContextMenu, isOwner, onChannelDeleted]);

    return (
        <div className="h-full w-64 bg-[#2B2D31] text-gray-200 border-r border-gray-700 flex flex-col overflow-y-auto py-3 px-2 space-y-4">

            {/* Заголовок сервера */}
            <div className="relative" ref={serverMenuRef}>
                <div className="flex items-center gap-2 px-2">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => setIsServerMenuOpen((current) => !current)}
                        className={`flex min-w-0 flex-1 items-center justify-between rounded-md px-3 py-2 text-left transition-colors ${isServerMenuOpen ? 'bg-[#404249] text-white' : 'hover:bg-[#3A3C41] text-white'
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex w-full items-center justify-between gap-3">
                                <Skeleton className="h-4 w-32 rounded-md" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </div>
                        ) : (
                            <>
                                <span className="truncate text-[15px] font-semibold">
                                    {serverName}
                                </span>
                                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isServerMenuOpen ? 'rotate-180' : ''}`} />
                            </>
                        )}
                    </button>

                    <div className="relative group shrink-0">
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={openInviteModal}
                            className="rounded-md p-2 text-gray-300 transition-colors hover:bg-[#3A3C41] hover:text-white"
                        >
                            {isLoading ? <Skeleton className="h-4 w-4 rounded-full" /> : <UserPlus className="h-4 w-4" />}
                        </button>
                        <span className="pointer-events-none absolute right-0 top-full mt-1
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 shadow-lg">
                            Пригласить на сервер
                        </span>
                    </div>
                </div>

                {isServerMenuOpen && (
                    <div className="absolute inset-x-2 top-full z-30 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#1f2126] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
                        <button
                            type="button"
                            onClick={openInviteModal}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-[#2b2d31] hover:text-white"
                        >
                            <span>Пригласить на сервер</span>
                            <UserPlus className="h-4 w-4" />
                        </button>

                        {isOwner && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => openCreateChannelModal(ChannelType.Server)}
                                    className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-[#2b2d31] hover:text-white"
                                >
                                    <span>Создать канал</span>
                                    <Hash className="h-4 w-4" />
                                </button>

                                <div className="my-2 h-px bg-white/10" />
                                <button
                                    type="button"
                                    onClick={openEditServerModal}
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-[#2b2d31] hover:text-white"
                                >
                                    <span>Настройки сервера</span>
                                    <Settings className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Текстовые каналы */}
            <div className="space-y-1">
                <div className="flex items-center justify-between px-2 text-xs font-semibold uppercase text-gray-400">
                    <button
                        onClick={() => setTextOpen(!textOpen)}
                        className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                        <ChevronDown
                            className={`w-4 h-4 transform transition-transform ${textOpen ? '' : '-rotate-90'}`}
                        />
                        Текстовые каналы
                    </button>

                    {isOwner && !isLoading && (
                        <button
                            type="button"
                            onClick={() => openCreateChannelModal(ChannelType.Server)}
                            className="rounded-md p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
                            aria-label="Создать текстовый канал"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {textOpen && (
                    <div className="space-y-1 mt-1">
                        {showChannelSkeleton ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="flex items-center gap-2 px-3 py-1.5">
                                    <Skeleton className="h-4 w-4 rounded-md" />
                                    <Skeleton className="h-4 w-28 rounded-md" />
                                </div>
                            ))
                        ) : textChannels.map((channel) => (
                            <div
                                key={channel.id}
                                onContextMenu={(event) => {
                                    event.preventDefault();
                                    openChannelContextMenu(event, channel);
                                }}
                                className="group relative"
                            >
                                <Link
                                    to={`/channels/${serverId}/${channel.id}`}
                                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 pr-10 text-sm transition-colors
                                        ${channelId === channel.id
                                            ? 'bg-[#404249] text-white'
                                            : 'text-gray-300 hover:bg-[#404249]'}`}
                                >
                                    <Hash className="w-4 h-4" />
                                    <span className="truncate">{channel.name}</span>
                                </Link>

                                {isOwner && (
                                    <button
                                        type="button"
                                        onClick={(event) => openChannelContextMenuFromButton(event, channel)}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-white/10 hover:text-white ${
                                            channelId === channel.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                        }`}
                                        aria-label={`Открыть меню канала ${channel.name}`}
                                    >
                                        <Ellipsis className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Голосовые каналы */}
            <div className="space-y-1">
                <div className="flex items-center justify-between px-2 text-xs font-semibold uppercase text-gray-400">
                    <button
                        onClick={() => setVoiceOpen(!voiceOpen)}
                        className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                        <ChevronDown
                            className={`w-4 h-4 transform transition-transform ${voiceOpen ? '' : '-rotate-90'}`}
                        />
                        Голосовые каналы
                    </button>

                    {isOwner && !isLoading && (
                        <button
                            type="button"
                            onClick={() => openCreateChannelModal(ChannelType.Voice)}
                            className="rounded-md p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
                            aria-label="Создать голосовой канал"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {voiceOpen && (
                    <div className="space-y-1 mt-1">
                        {showChannelSkeleton ? (
                            Array.from({ length: 2 }).map((_, index) => (
                                <div key={index} className="flex items-center gap-2 px-3 py-1.5">
                                    <Skeleton className="h-4 w-4 rounded-md" />
                                    <Skeleton className="h-4 w-24 rounded-md" />
                                </div>
                            ))
                        ) : voiceChannels.map((channel) => {
                            const isActiveVoiceChannel = activeVoiceSession?.channelId === channel.id;
                            const usersInChannel = voiceUsersByChannel[channel.id]
                                ?? (currentChannelId === channel.id ? voiceUsers : []);

                            return (
                                <div
                                    key={channel.id}
                                    onContextMenu={(event) => {
                                        event.preventDefault();
                                        openChannelContextMenu(event, channel);
                                    }}
                                    className="group"
                                >
                                    <div
                                        onClick={() => void joinChannel(channel.id, serverId, channel.name)}
                                        className={`relative flex items-center gap-2 rounded-md px-3 py-1.5 pr-10 text-sm transition-colors cursor-pointer
                                            ${isActiveVoiceChannel
                                                ? 'bg-emerald-500/12 text-emerald-100 ring-1 ring-emerald-400/25'
                                                : channelId === channel.id
                                                    ? 'bg-[#404249] text-white'
                                                    : 'text-gray-300 hover:bg-[#404249]'}`}
                                    >
                                        <Volume2 className={`w-4 h-4 ${isActiveVoiceChannel ? 'text-emerald-300' : ''}`} />
                                        <span className="truncate">{channel.name}</span>
                                        {isActiveVoiceChannel && (
                                            <span className="ml-auto mr-5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
                                        )}

                                        {isOwner && (
                                            <button
                                                type="button"
                                                onClick={(event) => openChannelContextMenuFromButton(event, channel)}
                                                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-white/10 hover:text-white ${
                                                    channelId === channel.id || isActiveVoiceChannel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                }`}
                                                aria-label={`Открыть меню канала ${channel.name}`}
                                            >
                                                <Ellipsis className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    {usersInChannel.length > 0 && (
                                        <div className="pl-4 space-y-0.5 text-xs text-gray-400">
                                            {usersInChannel.map((user) => (
                                                <div key={user.userId} className="flex items-center gap-2 px-2 py-1 rounded-md transition-colors hover:bg-[#404249] hover:text-gray-200 cursor-pointer">
                                                    {user.avatarUrl ? (
                                                        <img
                                                            src={resolveAssetUrl(user.avatarUrl)}
                                                            alt={user.displayName}
                                                            className="w-4 h-4 rounded-full object-cover shrink-0"
                                                        />
                                                    ) : (
                                                        <span className="w-4 h-4 rounded-full bg-[#3c3e45] text-[10px] flex items-center justify-center shrink-0">
                                                            {user.displayName.charAt(0)}
                                                        </span>
                                                    )}
                                                    <span className="truncate flex-1">{user.displayName}</span>
                                                    {user.isMicOn === false && (
                                                        <MicOff className="w-3 h-3 shrink-0 text-red-400" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Модалки */}
            <CreateChannelModal
                isOpen={isCreateChannelModalOpen}
                onClose={() => setIsCreateChannelModalOpen(false)}
                serverMembers={serverMembers}
                onCreate={createServer}
                initialChannelType={createChannelType}
            />

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                serverId={serverId}
            />

            {isEditServerModalOpen && (
                <EditServerModal
                    serverId={serverId}
                    currentName={serverName}
                    currentIconUrl={serverIconUrl}
                    channels={channels}
                    serverMembers={serverMembers}
                    onClose={() => setIsEditServerModalOpen(false)}
                    onSave={onServerUpdated}
                    onDelete={onServerDeleted}
                    onUpdateChannel={async (channelId, name, isPublic, memberIds) => {
                        const response = await channelsApi.updateServerChannel(serverId, channelId, { name, isPublic, memberIds });
                        onChannelUpdated(response.data);
                    }}
                    onDeleteChannel={async (channelId) => {
                        await onChannelDeleted(channelId);
                    }}
                />
            )}

            {editingChannel && (
                <EditChannelModal
                    serverId={serverId}
                    channel={editingChannel}
                    serverMembers={serverMembers}
                    onClose={() => setEditingChannel(null)}
                    onSave={async (name, isPublic, memberIds) => {
                        const response = await channelsApi.updateServerChannel(serverId, editingChannel.id, { name, isPublic, memberIds });
                        onChannelUpdated(response.data);
                    }}
                    onDelete={async () => {
                        await onChannelDeleted(editingChannel.id);
                    }}
                />
            )}

            {channelContextMenu && channelMenuItems.length > 0 && (
                <ContextMenu
                    x={channelContextMenu.x}
                    y={channelContextMenu.y}
                    items={channelMenuItems}
                    onClose={() => setChannelContextMenu(null)}
                />
            )}
        </div>
    );
}
