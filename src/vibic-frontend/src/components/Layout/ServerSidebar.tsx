import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import CreateServerModal from '../Server/CreateServerModal';
import { ServerSummaryResponse } from '../../types/ServerType';
import { serversApi } from '../../api/serversApi';
import { resolveAssetUrl } from '../../api/httpClient';


export default function ServerSidebar() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [servers, setServers] = useState<ServerSummaryResponse[]>([]);

    const CreateServer = async (name: string, iconFile: File | null) => {

        try {
            const response = await serversApi.createServer(name, iconFile);

            setServers(prev => [...prev, response.data]);
        } catch (error) {
            console.log('Не удалось создать сервер')
        }
    };

    useEffect(() => {
        const ReceiveMyServers = (async () => {
            try {
                const response = await serversApi.getMyServers();

                setServers(response.data);
            } catch (error) {
                console.log('Не получилось получить список серверов', error)
            }
        })

        ReceiveMyServers();
    }, [])

    return (
        <div className="w-[72px] flex flex-col items-center py-4 gap-4">

            {/* Vibic Logo button */}
            <Link
                to="/channels/@me"
                className="group w-12 h-12 rounded-2xl hover:rounded-3xl hover:bg-[#5865F2]/40 transition-all flex items-center justify-center overflow-hidden"
            >
                <img
                    src="/vibic_logo.svg"
                    alt="Vibic Logo"
                    className="w-7 h-7 object-contain"
                />
            </Link>

            {servers.map((server) => (
                <div key={server.id} className="group relative">
                    <Link
                        to={`/channels/${server.id}/${server.channelId}`}
                        className="relative w-10 h-10 bg-indigo-500 rounded-2xl transition-all hover:rounded-3xl flex items-center justify-center overflow-hidden"
                    >
                        {server.iconUrl ? (
                            <img src={resolveAssetUrl(server.iconUrl)} alt={server.name} className="absolute inset-0 w-full h-full object-cover object-center" />
                        ) : (
                            <span className="text-white font-bold">{server.name.charAt(0)}</span>
                        )}
                    </Link>

                    <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {server.name}
                    </div>
                </div>
            ))}


            <button onClick={() => setIsCreateModalOpen(true)}
                className="w-10 h-10 bg-gray-600 rounded-2xl transition-all text-white hover:rounded-3xl hover:bg-gray-500 flex items-center justify-center"
            >
                <Plus className="w-5 h-5" />
            </button>

            {isCreateModalOpen && (
                <CreateServerModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={CreateServer}
                />
            )}
        </div>
    );
}
