import { Link, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import CreateServerModal from '../Server/CreateServerModal';
import { ServerSummaryResponse } from '../../types/ServerType';
import { serversApi } from '../../api/serversApi';
import { resolveAssetUrl } from '../../api/httpClient';


export default function ServerSidebar() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [servers, setServers] = useState<ServerSummaryResponse[]>([]);
    const { serverId } = useParams<{ serverId: string }>();

    const createServer = async (name: string, iconFile: File | null) => {
        try {
            const response = await serversApi.createServer(name, iconFile);
            setServers(prev => [...prev, response.data]);
        } catch {
            console.log('Не удалось создать сервер');
        }
    };

    useEffect(() => {
        const fetchServers = async () => {
            try {
                const response = await serversApi.getMyServers();
                setServers(response.data);
            } catch (error) {
                console.log('Не получилось получить список серверов', error);
            }
        };
        fetchServers();
    }, []);

    return (
        <div className="w-[72px] flex flex-col items-center py-3 gap-2 bg-[#1e1f22] border-r border-white/[0.05]">

            {/* Home / DM button */}
            <Link
                to="/channels/@me"
                className="group relative flex items-center justify-center w-12 h-12 rounded-2xl hover:rounded-3xl bg-[#313338] hover:bg-indigo-600 transition-all duration-200 overflow-hidden"
            >
                <img
                    src="/vibic_logo.svg"
                    alt="Vibic"
                    className="w-6 h-6 object-contain"
                />
                <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-black text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                    Личные сообщения
                </span>
            </Link>

            {/* Separator */}
            <div className="w-8 h-px bg-white/10 my-1" />

            {/* Server list */}
            {servers.map((server) => {
                const isActive = server.id === serverId;
                return (
                    <div key={server.id} className="group relative flex items-center">
                        {/* Active indicator */}
                        <div className={`absolute -left-3 w-1 rounded-r-full bg-white transition-all duration-200 ${isActive ? 'h-8' : 'h-0 group-hover:h-5'}`} />

                        <Link
                            to={`/channels/${server.id}/${server.channelId}`}
                            className={`relative w-12 h-12 flex items-center justify-center overflow-hidden transition-all duration-200 ${
                                isActive
                                    ? 'rounded-2xl'
                                    : 'rounded-3xl hover:rounded-2xl'
                            } ${!server.iconUrl ? 'bg-indigo-600 hover:bg-indigo-500' : ''}`}
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
                        </Link>

                        <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-black text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                            {server.name}
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
