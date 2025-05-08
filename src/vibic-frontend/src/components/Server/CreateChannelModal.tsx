import { useState } from 'react';
import { Hash, Volume2, Lock } from 'lucide-react';
import { ServerChannelRequest } from '../../types/channels/ServerChannelType';
import { ChannelType } from '../../types/enums/ChannelType';


interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (request: ServerChannelRequest) => void;
}

export default function CreateChannelModal({ isOpen, onClose, onCreate }: Props) {
    const [type, setType] = useState<ChannelType>(ChannelType.Server);
    const [name, setName] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-[#2B2D31] w-full max-w-md rounded-lg p-6 relative shadow-xl">

                {/* Кнопка закрытия */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">&times;</button>

                <h2 className="text-white text-xl font-bold mb-2">Создать канал</h2>
                <p className="text-gray-400 text-sm mb-4">в Текстовые каналы</p>

                {/* Выбор типа канала */}
                <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Тип Канала</p>
                    <div className="space-y-2">
                        <label className={`flex items-center gap-2 p-3 rounded cursor-pointer ${type === ChannelType.Server ? 'bg-[#404249] text-white' : 'bg-[#1E1F22] text-gray-400'}`}>
                            <input type="radio" name="type" className="accent-blue-500" checked={type === ChannelType.Server} onChange={() => setType(ChannelType.Server)} />
                            <Hash className="w-5 h-5" />
                            <div>
                                <p className="text-sm font-semibold">Текст</p>
                                <p className="text-xs">Отправляйте сообщения, изображения, эмодзи, мемы и т.д.</p>
                            </div>
                        </label>

                        <label className={`flex items-center gap-2 p-3 rounded cursor-pointer ${type === ChannelType.Voice ? 'bg-[#404249] text-white' : 'bg-[#1E1F22] text-gray-400'}`}>
                            <input type="radio" name="type" className="accent-blue-500" checked={type === ChannelType.Voice} onChange={() => setType(ChannelType.Voice)} />
                            <Volume2 className="w-5 h-5" />
                            <div>
                                <p className="text-sm font-semibold">Голос</p>
                                <p className="text-xs">Общайтесь голосом или в видеочате</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Название канала */}
                <div className="mb-4">
                    <label className="text-sm text-gray-400">Название канала</label>
                    <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">#</span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="новый-канал"
                            className="w-full pl-7 pr-3 py-2 rounded bg-[#1E1F22] text-white text-sm placeholder-gray-500 outline-none"
                        />
                    </div>
                </div>

                {/* Приватный канал */}
                <div className="mb-6">
                    <label className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Lock className="w-4 h-4" />
                            Приватный канал
                        </div>
                        <div>
                            <button
                                onClick={() => setIsPublic(prev => !prev)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${!isPublic ? 'bg-indigo-600' : 'bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${!isPublic ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </label>
                    <p className="text-xs text-gray-500 ml-6 mt-1">
                        Только участники и участники с выбранными ролями смогут просматривать этот канал.
                    </p>

                </div>

                {/* Кнопки */}
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">Отмена</button>
                    <button
                        onClick={() => {
                            onCreate({
                                name: name,
                                channelType: type,
                                isPublic: isPublic
                            });
                            onClose();
                        }}
                        disabled={!name.trim()}
                        className="text-sm px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                    >
                        Создать канал
                    </button>
                </div>
            </div>
        </div>
    );
}
