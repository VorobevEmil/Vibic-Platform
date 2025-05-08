import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { invitesApi } from '../api/invitesApi';

export default function InvitePage() {
    const { inviteCode } = useParams<{ inviteCode: string }>();
    const [serverName, setServerName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                const response = await invitesApi.getInvite(inviteCode!);
                setServerName(response.data.serverName);
            } catch (err) {
                console.error('Ошибка получения приглашения', err);
            }
        };
        fetchInvite();
    }, [inviteCode]);

    const joinServer = async () => {
        try {
            const response = await invitesApi.joinServer(inviteCode!);
            const serverId = response.data.serverId;
            const channelId = response.data.channelId;
            navigate(`/channels/${serverId}/${channelId}`);
        } catch (err) {
            console.error('Ошибка при вступлении на сервер', err);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded">
            <h1 className="text-xl font-bold mb-4">Приглашение на сервер</h1>
            <p className="mb-4">Вы приглашены на сервер <strong>{serverName}</strong>.</p>
            <button onClick={joinServer} className="bg-blue-600 text-white px-4 py-2 rounded">Присоединиться</button>
        </div>
    );
}
