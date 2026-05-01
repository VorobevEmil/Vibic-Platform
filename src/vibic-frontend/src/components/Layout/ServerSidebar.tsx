import { Link, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import CreateServerModal from '../Server/CreateServerModal';
import { ServerSummaryResponse } from '../../types/ServerType';
import { serversApi } from '../../api/serversApi';
import { resolveAssetUrl } from '../../api/httpClient';
import Skeleton from '../ui/Skeleton';
import { useVoice } from '../../context/VoiceContext';
import { useCallContext } from '../../context/CallContext';


export default function ServerSidebar() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [servers, setServers] = useState<ServerSummaryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { serverId } = useParams<{ serverId: string }>();
    const { activeVoiceSession } = useVoice();
    const { activeCallRequest } = useCallContext();

    const createServer = async (name: string, iconFile: File | null) => {
        try {
            const response = await serversApi.createServer(name, iconFile);
            setServers(prev => [...prev, response.data]);
        } catch {
            console.log('Не удалось создать сервер');
        }
    };

    const fetchServers = async () => {
        setIsLoading(true);
        try {
            const response = await serversApi.getMyServers();
            setServers(response.data);
        } catch (error) {
            console.log('Не получилось получить список серверов', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServers();

        window.addEventListener('server-list-changed', fetchServers);
        return () => window.removeEventListener('server-list-changed', fetchServers);
    }, []);

    return (
        <div className="w-[72px] flex flex-col items-center py-3 gap-2 bg-[#1e1f22] border-r border-white/[0.05]">

            {/* Home / DM button */}
            <Link
                to="/channels/@me"
                className={`group relative flex items-center justify-center w-12 h-12 rounded-2xl hover:rounded-3xl bg-[#313338] hover:bg-indigo-600 transition-all duration-200 overflow-hidden ${
                    activeCallRequest ? 'ring-2 ring-sky-400/70 ring-offset-2 ring-offset-[#1e1f22]' : ''
                }`}
            >
                <img
                    src="/vibic_logo.svg"
                    alt="Vibic"
                    className="w-6 h-6 object-contain"
                />
                {activeCallRequest && (
                    <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-[#313338] bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.14)]" />
                )}
                <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-black text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                    {activeCallRequest ? 'Личный звонок активен' : 'Личные сообщения'}
                </span>
            </Link>

            {/* Separator */}
            <div className="w-8 h-px bg-white/10 my-1" />

            {/* Server list */}
            {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center">
                        <Skeleton className="h-12 w-12 rounded-3xl" />
                    </div>
                ))
            ) : servers.map((server) => {
                const isActive = server.id === serverId;
                const hasActiveVoiceCall = activeVoiceSession?.serverId === server.id;
                return (
                    <div key={server.id} className="group relative flex items-center">
                        {/* Active indicator */}
                        <div className={`absolute -left-3 w-1 rounded-r-full transition-all duration-200 ${
                            hasActiveVoiceCall ? 'h-10 bg-emerald-400' : `bg-white ${isActive ? 'h-8' : 'h-0 group-hover:h-5'}`
                        }`} />

                        <Link
                            to={`/channels/${server.id}/${server.channelId}`}
                            className={`relative w-12 h-12 flex items-center justify-center overflow-hidden transition-all duration-200 ${
                                isActive
                                    ? 'rounded-2xl'
                                    : 'rounded-3xl hover:rounded-2xl'
                            } ${!server.iconUrl ? 'bg-indigo-600 hover:bg-indigo-500' : ''} ${
                                hasActiveVoiceCall ? 'ring-2 ring-emerald-400/70 ring-offset-2 ring-offset-[#1e1f22]' : ''
                            }`}
                        >
                            {server.iconUrl ? (
                                <img
                                    src={resolveAssetUrl(server.iconUrl)}
                                    alt={server.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-bold text-sm">
                                    {server.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                            {hasActiveVoiceCall && (
                                <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-[#313338] bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.14)]" />
                            )}
                        </Link>

                        <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-black text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                            {hasActiveVoiceCall ? `${server.name} · голосовой канал активен` : server.name}
                        </span>
                    </div>
                );
            })}

            {/* Add server */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="group relative w-12 h-12 rounded-3xl hover:rounded-2xl bg-[#313338] hover:bg-green-600 text-green-500 hover:text-white flex items-center justify-center transition-all duration-200"
                title="Создать сервер"
            >
                <Plus className="w-5 h-5" />
                <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-black text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                    Создать сервер
                </span>
            </button>

            {isCreateModalOpen && (
                <CreateServerModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={createServer}
                />
            )}
        </div>
    );
}
