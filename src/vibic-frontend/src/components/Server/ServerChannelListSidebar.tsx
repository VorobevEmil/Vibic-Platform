import { Link, useParams } from 'react-router-dom';
import { ServerChannelResponse } from '../../types/ServerType';
import { useEffect, useRef, useState } from 'react';
import {
    ChevronDown,
    Hash,
    Volume2,
    UserPlus,
    MicOff,
    Settings,
} from 'lucide-react';
import { channelsApi } from '../../api/channelsApi';
import CreateChannelModal from './CreateChannelModal';
import { ServerChannelRequest } from '../../types/channels/ServerChannelType';
import InviteModal from './InviteModal';
import EditServerModal from './EditServerModal';
import { ChannelType } from '../../types/enums/ChannelType';
import { useVoice } from '../../context/VoiceContext';
import { resolveAssetUrl } from '../../api/httpClient';
import Skeleton from '../ui/Skeleton';

interface ServerChannelListSidebarProps {
    serverName: string;
    serverId: string;
    serverIconUrl?: string | null;
    isOwner: boolean;
    channels: ServerChannelResponse[];
    isLoading?: boolean;
    onChannelCreated: (channel: ServerChannelResponse) => void;
    onServerUpdated: (name: string, iconFile: File | null) => Promise<void>;
    onServerDeleted: () => Promise<void>;
}

export default function ServerChannelListSidebar({ serverName, serverId, serverIconUrl, isOwner, channels, isLoading = false, onChannelCreated, onServerUpdated, onServerDeleted }: ServerChannelListSidebarProps) {
    const { channelId } = useParams<{ channelId: string }>();

    const [textOpen, setTextOpen] = useState(true);
    const [voiceOpen, setVoiceOpen] = useState(true);
    const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);

    const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditServerModalOpen, setIsEditServerModalOpen] = useState(false);
    const { joinChannel, voiceUsers, voiceUsersByChannel, currentChannelId } = useVoice();
    const serverMenuRef = useRef<HTMLDivElement | null>(null);

    const textChannels = channels?.filter((c) => c.channelType === ChannelType.Server);
    const voiceChannels = channels?.filter((c) => c.channelType === ChannelType.Voice);
    const showChannelSkeleton = isLoading && channels.length === 0;

    const createServer = async (request: ServerChannelRequest) => {
        try {
            const response = await channelsApi.createServerChannel(serverId, request);
            onChannelCreated(response.data);
            setIsCreateChannelModalOpen(false);
        } catch (err) {
            console.error('Ошибка при создании канала', err);
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

    const openCreateChannelModal = () => {
        setIsServerMenuOpen(false);
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

                        <button
                            type="button"
                            onClick={openCreateChannelModal}
                            className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-[#2b2d31] hover:text-white"
                        >
                            <span>Создать канал</span>
                            <Hash className="h-4 w-4" />
                        </button>

                        {isOwner && (
                            <>
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
                            <Link
                                key={channel.id}
                                to={`/channels/${serverId}/${channel.id}`}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors
                                    ${channelId === channel.id
                                        ? 'bg-[#404249] text-white'
                                        : 'text-gray-300 hover:bg-[#404249]'}`}
                            >
                                <Hash className="w-4 h-4" />
                                <span className="truncate">{channel.name}</span>
                            </Link>
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
                            const usersInChannel = voiceUsersByChannel[channel.id]
                                ?? (currentChannelId === channel.id ? voiceUsers : []);

                            return (
                                <div key={channel.id}>
                                    <div
                                        onClick={async () => await joinChannel(channel.id, serverId)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer
                                            ${channelId === channel.id
                                                ? 'bg-[#404249] text-white'
                                                : 'text-gray-300 hover:bg-[#404249]'}`}
                                    >
                                        <Volume2 className="w-4 h-4" />
                                        <span className="truncate">{channel.name}</span>
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
                onCreate={createServer}
            />

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                serverId={serverId}
            />

            {isEditServerModalOpen && (
                <EditServerModal
                    currentName={serverName}
                    currentIconUrl={serverIconUrl}
                    onClose={() => setIsEditServerModalOpen(false)}
                    onSave={onServerUpdated}
                    onDelete={onServerDeleted}
                />
            )}
        </div>
    );
}
