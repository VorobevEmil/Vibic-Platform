import { useEffect, useState } from 'react';
import useSearchUsers from '../../hooks/useSearchUsers'
import SearchResultItem from './SearchResultItem';
import { resolveOrCreateChannel } from '../../services/channelService';
import { useNavigate } from 'react-router-dom';
import DirectChannelResponse from '../../types/channels/DirectChannelType';
import Skeleton from '../ui/Skeleton';

interface Props {
  channels: DirectChannelResponse[];
  onUpdateChannel: (channel: DirectChannelResponse) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchUserOverlay({ channels, onUpdateChannel, isOpen, onClose }: Props) {
  const [searchChannel, setSearchChannel] = useState('');
  const { results, isLoading } = useSearchUsers(searchChannel);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        setSearchChannel('');
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleClick = async (userId: string) => {
    try {
      const channel = await resolveOrCreateChannel(userId, channels);
      if (channel) {
        onUpdateChannel(channel);
        navigate(`/channels/@me/${channel.id}`);
      }
    } catch (error) {
      console.error('Ошибка создания канала:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#171b27] text-white w-full max-w-xl rounded-lg p-6 shadow-lg">
        <h2 className="text-center mb-4 text-lg">Поиск серверов, каналов или ЛС</h2>

        <input
          type="text"
          autoFocus
          placeholder="Куда отправимся?"
          className="w-full mb-4 px-4 py-2 rounded bg-[#0e1016] placeholder-gray-400 text-sm"
          value={searchChannel}
          onChange={(e) => setSearchChannel(e.target.value)}
        />

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {isLoading && searchChannel.trim() !== '' ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-xl bg-[#252a3d] px-3 py-2.5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
              </div>
            ))
          ) : results.length === 0 && searchChannel.trim() !== '' ? (
            <div className="text-sm text-gray-400">Ничего не найдено</div>
          ) : (
            results.map((user) => (
              <SearchResultItem key={user.id} user={user} onClick={() => handleClick(user.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
