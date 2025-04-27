import { Link, useParams } from 'react-router-dom';
import { ServerChannelResponse } from '../../types/ServerType';

interface ServerChannelListSidebarProps {
    serverId: string;
    channels: ServerChannelResponse[] | null;
}

export default function ServerChannelListSidebar({ serverId, channels }: ServerChannelListSidebarProps) {

    const { channelId } = useParams<{ channelId: string }>();

    return (
        <div className="w-60 bg-[#2b2d31] flex flex-col p-4 gap-2 overflow-y-auto">
            <h2 className="text-sm font-bold text-gray-400 mb-2">ТЕКСТОВЫЕ КАНАЛЫ</h2>
            {channels?.map((channel) => (
                <Link
                    key={channel.id}
                    to={`/channels/${serverId}/${channel.id}`}
                    className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 ${channelId === channel.id ? 'bg-gray-700 text-white' : 'text-gray-300'
                        }`}
                >
                    # {channel.name}
                </Link>
            ))}
        </div>
    );
}
