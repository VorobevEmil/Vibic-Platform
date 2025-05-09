import { Link, useParams } from 'react-router-dom';
import { ServerChannelResponse } from '../../types/ServerType';
import { useState } from 'react';
import {
    ChevronDown,
    Plus,
    Hash,
    Volume2,
    UserPlus
} from 'lucide-react';
import { channelsApi } from '../../api/channelsApi';
import CreateChannelModal from './CreateChannelModal';
import { ServerChannelRequest } from '../../types/channels/ServerChannelType';
import InviteModal from './InviteModal';
import { ChannelType } from '../../types/enums/ChannelType';
import { useVoice } from '../../context/VoiceContext';

interface ServerChannelListSidebarProps {
    serverName: string;
    serverId: string;
    channels: ServerChannelResponse[];
    onChannelCreated: (channel: ServerChannelResponse) => void;
}

export default function ServerChannelListSidebar({ serverName, serverId, channels, onChannelCreated }: ServerChannelListSidebarProps) {
    const { channelId } = useParams<{ channelId: string }>();

    const [textOpen, setTextOpen] = useState(true);
    const [voiceOpen, setVoiceOpen] = useState(true);

    const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const { joinChannel, voiceUsers, currentChannelId } = useVoice();

    const textChannels = channels?.filter((c) => c.channelType === ChannelType.Server);
    const voiceChannels = channels?.filter((c) => c.channelType === ChannelType.Voice);

    const createServer = async (request: ServerChannelRequest) => {
        try {
            const response = await channelsApi.createServerChannel(serverId, request);
            onChannelCreated(response.data);
            setIsCreateChannelModalOpen(false);
        } catch (err) {
            console.error('Ошибка при создании канала', err);
        }
    };

    return (
        <div className="h-full w-64 bg-[#2B2D31] text-gray-200 border-r border-gray-700 flex flex-col overflow-y-auto py-3 px-2 space-y-4">

            {/* Заголовок сервера */}
            <div className="flex items-center justify-between px-2 py-2 hover:bg-[#3A3C41] rounded transition-colors cursor-pointer">
                <span className="text-sm font-semibold uppercase text-gray-400 truncate max-w-[140px]">
                    Сервер {serverName}
                </span>
                <div className="relative group" onClick={() => setIsInviteModalOpen(true)}>
                    <UserPlus className="w-4 h-4 hover:text-white" />
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 shadow-lg">
                        Пригласить на сервер
                    </span>
                </div>
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
                    <div className="relative group cursor-pointer" onClick={() => setIsCreateChannelModalOpen(true)}>
                        <Plus className="w-4 h-4 hover:text-white" />
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 shadow-lg">
                            Создать канал
                        </span>
                    </div>
                </div>

                {textOpen && (
                    <div className="space-y-1 mt-1">
                        {textChannels.map((channel) => (
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
                    <div className="relative group cursor-pointer" onClick={() => setIsCreateChannelModalOpen(true)}>
                        <Plus className="w-4 h-4 hover:text-white" />
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 shadow-lg">
                            Создать канал
                        </span>
                    </div>
                </div>

                {voiceOpen && (
                    <div className="space-y-1 mt-1">
                        {voiceChannels.map((channel) => {
                            const usersInChannel = voiceUsers.filter(u => currentChannelId === channel.id);

                            return (
                                <div key={channel.id}>
                                    <div
                                        onClick={async () => await joinChannel(channel.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer
                                            ${channelId === channel.id
                                                ? 'bg-[#404249] text-white'
                                                : 'text-gray-300 hover:bg-[#404249]'}`}
                                    >
                                        <Volume2 className="w-4 h-4" />
                                        <span className="truncate">{channel.name}</span>
                                    </div>

                                    {usersInChannel.length > 0 && (
                                        <div className="pl-8 space-y-1 text-xs text-gray-400">
                                            {usersInChannel.map((user) => (
                                                <div key={user.userId}>👤 {user.displayName}</div>
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
        </div>
    );
}