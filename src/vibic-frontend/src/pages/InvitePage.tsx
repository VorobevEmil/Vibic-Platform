import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { invitesApi } from '../api/invitesApi';
import { Users, ArrowRight, X } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';

export default function InvitePage() {
    const { inviteCode } = useParams<{ inviteCode: string }>();
    const [serverName, setServerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isInviteLoading, setIsInviteLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvite = async () => {
            setIsInviteLoading(true);
            try {
                const response = await invitesApi.getInvite(inviteCode!);
                setServerName(response.data.serverName);
            } catch (err) {
                console.error('Ошибка получения приглашения', err);
            } finally {
                setIsInviteLoading(false);
            }
        };
        void fetchInvite();
    }, [inviteCode]);

    const joinServer = async () => {
        setLoading(true);
        try {
            const response = await invitesApi.joinServer(inviteCode!);
            const serverId = response.data.serverId;
            const channelId = response.data.channelId;
            navigate(`/channels/${serverId}/${channelId}`);
        } catch (err) {
            console.error('Ошибка при вступлении на сервер', err);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1e1f22] flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-48 -left-24 w-[480px] h-[480px] rounded-full bg-indigo-600/[0.12] blur-3xl" />
                <div className="absolute -bottom-48 -right-24 w-[480px] h-[480px] rounded-full bg-violet-600/[0.10] blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                        <img src="/vibic_logo.svg" alt="Vibic" className="h-5 w-5 object-contain" />
                    </div>
                    <span className="text-xl font-bold text-white">Vibic</span>
                </div>

                {/* Card */}
                <div className="bg-[#25262b] border border-white/[0.07] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Banner */}
                    <div className="h-24 bg-gradient-to-br from-indigo-600/40 via-violet-600/30 to-transparent relative">
                        <div className="absolute inset-0 bg-[url('/vibic_logo.svg')] bg-center bg-no-repeat opacity-5 bg-[length:120px]" />
                    </div>

                    <div className="px-6 pb-6 -mt-8">
                        {/* Server icon */}
                        <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border-4 border-[#25262b] flex items-center justify-center mb-4 shadow-lg">
                            <Users className="w-7 h-7 text-indigo-300" />
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                            Вы приглашены присоединиться к
                        </p>
                        {isInviteLoading ? (
                            <div className="mb-1 space-y-2">
                                <Skeleton className="h-8 w-56 max-w-full rounded-lg" />
                                <Skeleton className="h-4 w-32 rounded-md" />
                            </div>
                        ) : (
                            <h1 className="text-2xl font-bold text-white mb-1">
                                {serverName || '...'}
                            </h1>
                        )}

                        <div className="mt-6 space-y-2">
                            <button
                                onClick={joinServer}
                                disabled={loading || !serverName || isInviteLoading}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-3 rounded-xl transition-all shadow-lg shadow-indigo-900/30"
                            >
                                {isInviteLoading ? (
                                    <div className="flex w-full items-center justify-center">
                                        <Skeleton className="h-4 w-40 rounded-md bg-white/20" />
                                    </div>
                                ) : loading ? (
                                    <span className="animate-pulse">Вступаем...</span>
                                ) : (
                                    <>
                                        Присоединиться к серверу
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => navigate('/channels/@me')}
                                className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm py-2 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                Отказаться от приглашения
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
