import { Link, useParams } from 'react-router-dom';
import { ServerChannelResponse, ServerMemberResponse } from '../../types/ServerType';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    BellOff,
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
import { useUnreadContext } from '../../context/UnreadContext';
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
    const { unreadCounts, toggleMute, isMuted } = useUnreadContext();

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
        <div className="h-full w-64 bg-[#171b27] text-gray-200 border-r border-white/[0.05] flex flex-col overflow-y-auto py-3 px-2 space-y-4">

            {/* Server header */}
            <div className="relative" ref={serverMenuRef}>
                <div className="flex items-center gap-2 px-1">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => setIsServerMenuOpen((current) => !current)}
                        className={`flex min-w-0 flex-1 items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                            isServerMenuOpen
                                ? 'bg-[#252c3f] text-white'
                                : 'hover:bg-[#1c2032] text-white'
                        }`}
                    >
                        {isLoading ? (
                            <div className="flex w-full items-center justify-between gap-3">
                                <Skeleton className="h-4 w-32 rounded-md" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </div>
                        ) : (
                            <>
                                <span className="truncate text-[14px] font-semibold tracking-tight">
                                    {serverName}
                                </span>
                                <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#6b7292] transition-transform duration-200 ${isServerMenuOpen ? 'rotate-180' : ''}`} />
                            </>
                        )}
                    </button>

                    <div className="relative group shrink-0">
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={openInviteModal}
                            className="rounded-lg p-2 text-[#555c78] transition-all duration-150 hover:bg-[#1c2032] hover:text-[#c8cce0]"
                        >
                            {isLoading ? <Skeleton className="h-4 w-4 rounded-full" /> : <UserPlus className="h-4 w-4" />}
                        </button>
                        <span className="pointer-events-none absolute right-0 top-full mt-1.5
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            bg-[#0a0c12] border border-white/[0.08] text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap z-50 shadow-2xl">
                            Пригласить
                        </span>
                    </div>
                </div>

                {isServerMenuOpen && (
                    <div className="absolute inset-x-1 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0f1219] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-fade-slide-down">
                        <button
                            type="button"
                            onClick={openInviteModal}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#8b90a8] transition-all duration-150 hover:bg-[#1c2032] hover:text-white"
                        >
                            <span>Пригласить на сервер</span>
                            <UserPlus className="h-4 w-4" />
                        </button>

                        {isOwner && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => openCreateChannelModal(ChannelType.Server)}
                                    className="mt-0.5 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#8b90a8] transition-all duration-150 hover:bg-[#1c2032] hover:text-white"
                                >
                                    <span>Создать канал</span>
                                    <Hash className="h-4 w-4" />
                                </button>

                                <div className="my-1.5 h-px bg-white/[0.06]" />
                                <button
                                    type="button"
                                    onClick={openEditServerModal}
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#8b90a8] transition-all duration-150 hover:bg-[#1c2032] hover:text-white"
                                >
                                    <span>Настройки сервера</span>
                                    <Settings className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Text channels */}
            <div className="space-y-0.5">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#3d4465]">
                    <button
                        onClick={() => setTextOpen(!textOpen)}
                        className="flex items-center gap-1.5 hover:text-[#8b90a8] transition-colors"
                    >
                        <ChevronDown
                            className={`w-3 h-3 transform transition-transform duration-200 ${textOpen ? '' : '-rotate-90'}`}
                        />
                        Текстовые
                    </button>

                    {isOwner && !isLoading && (
                        <button
                            type="button"
                            onClick={() => openCreateChannelModal(ChannelType.Server)}
                            className="rounded-md p-1 text-[#3d4465] transition-all duration-150 hover:bg-white/[0.06] hover:text-[#8b90a8]"
                            aria-label="Создать текстовый канал"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {textOpen && (
                    <div className="space-y-0.5 mt-0.5">
                        {showChannelSkeleton ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="flex items-center gap-2 px-3 py-1.5">
                                    <Skeleton className="h-4 w-4 rounded-md" />
                                    <Skeleton className="h-4 w-28 rounded-md" />
                                </div>
                            ))
                        ) : textChannels.map((channel) => {
                            const isActive = channelId === channel.id;
                            const muted = isMuted(channel.id);
                            const unread = unreadCounts[channel.id] ?? 0;
                            const hasUnread = unread > 0 && !muted;

                            return (
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
                                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 pr-9 text-sm transition-all duration-150
                                            ${isActive
                                                ? 'bg-[#252c3f] text-white'
                                                : hasUnread
                                                    ? 'text-white hover:bg-[#1c2032]'
                                                    : 'text-[#6b7292] hover:bg-[#1c2032] hover:text-[#c8cce0]'}`}
                                    >
                                        <Hash className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : hasUnread ? 'text-indigo-400/70' : 'text-[#3d4465]'}`} />
                                        <span className={`truncate flex-1 ${hasUnread && !isActive ? 'font-semibold' : ''}`}>
                                            {channel.name}
                                        </span>
                                        {hasUnread && !isActive && (
                                            <span className="min-w-[18px] h-[18px] rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none ml-1 shrink-0">
                                                {unread > 99 ? '99+' : unread}
                                            </span>
                                        )}
                                    </Link>

                                    <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all duration-150`}>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleMute(channel.id); }}
                                            className={`rounded-md p-1 transition-all duration-150 ${
                                                muted ? 'text-[#555c78] hover:text-white' : 'text-[#555c78] hover:text-white hover:bg-white/[0.08]'
                                            }`}
                                            title={muted ? 'Включить уведомления' : 'Отключить уведомления'}
                                        >
                                            <BellOff className="h-3.5 w-3.5" />
                                        </button>
                                        {isOwner && (
                                            <button
                                                type="button"
                                                onClick={(event) => openChannelContextMenuFromButton(event, channel)}
                                                className="rounded-md p-1 text-[#555c78] transition-all duration-150 hover:bg-white/[0.08] hover:text-white"
                                                aria-label={`Открыть меню канала ${channel.name}`}
                                            >
                                                <Ellipsis className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Voice channels */}
            <div className="space-y-0.5">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#3d4465]">
                    <button
                        onClick={() => setVoiceOpen(!voiceOpen)}
                        className="flex items-center gap-1.5 hover:text-[#8b90a8] transition-colors"
                    >
                        <ChevronDown
                            className={`w-3 h-3 transform transition-transform duration-200 ${voiceOpen ? '' : '-rotate-90'}`}
                        />
                        Голосовые
                    </button>

                    {isOwner && !isLoading && (
                        <button
                            type="button"
                            onClick={() => openCreateChannelModal(ChannelType.Voice)}
                            className="rounded-md p-1 text-[#3d4465] transition-all duration-150 hover:bg-white/[0.06] hover:text-[#8b90a8]"
                            aria-label="Создать голосовой канал"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {voiceOpen && (
                    <div className="space-y-0.5 mt-0.5">
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
                                        className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 pr-9 text-sm transition-all duration-150 cursor-pointer
                                            ${isActiveVoiceChannel
                                                ? 'bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-400/20'
                                                : channelId === channel.id
                                                    ? 'bg-[#252c3f] text-white'
                                                    : 'text-[#6b7292] hover:bg-[#1c2032] hover:text-[#c8cce0]'}`}
                                    >
                                        <Volume2 className={`w-3.5 h-3.5 shrink-0 ${isActiveVoiceChannel ? 'text-emerald-400' : 'text-[#3d4465]'}`} />
                                        <span className="truncate">{channel.name}</span>
                                        {isActiveVoiceChannel && (
                                            <span className="ml-auto mr-5 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.15)]" />
                                        )}

                                        {isOwner && (
                                            <button
                                                type="button"
                                                onClick={(event) => openChannelContextMenuFromButton(event, channel)}
                                                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#555c78] transition-all duration-150 hover:bg-white/[0.08] hover:text-white ${
                                                    channelId === channel.id || isActiveVoiceChannel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                }`}
                                                aria-label={`Открыть меню канала ${channel.name}`}
                                            >
                                                <Ellipsis className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {usersInChannel.length > 0 && (
                                        <div className="pl-4 space-y-0.5 mt-0.5">
                                            {usersInChannel.map((user) => (
                                                <div key={user.userId} className="flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-150 hover:bg-[#1c2032] text-[#555c78] hover:text-[#8b90a8] cursor-pointer">
                                                    {user.avatarUrl ? (
                                                        <img
                                                            src={resolveAssetUrl(user.avatarUrl)}
                                                            alt={user.displayName}
                                                            className="w-4 h-4 rounded-full object-cover shrink-0"
                                                        />
                                                    ) : (
                                                        <span className="w-4 h-4 rounded-full bg-[#252a3d] text-[10px] flex items-center justify-center shrink-0">
                                                            {user.displayName.charAt(0)}
                                                        </span>
                                                    )}
                                                    <span className="truncate flex-1 text-xs">{user.displayName}</span>
                                                    {user.isMicOn === false && (
                                                        <MicOff className="w-3 h-3 shrink-0 text-red-400/70" />
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

            {/* Modals */}
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
