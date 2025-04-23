import { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';

interface CreateServerModalProps {
    onClose: () => void;
    onCreate: (name: string, iconFile: File | null) => void;
}

export default function CreateServerModal({ onClose, onCreate }: CreateServerModalProps) {
    const [serverName, setServerName] = useState('');
    const [iconFile, setIconFile] = useState<File | null>(null);

    const handleSubmit = () => {
        if (!serverName.trim()) return;
        onCreate(serverName, iconFile);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#2b2d31] text-white p-6 rounded-lg shadow-lg w-[400px] relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-4">Персонализируйте свой сервер</h2>
                <p className="text-sm text-gray-400 mb-4">
                    Персонализируйте свой новый сервер, выбрав ему название и значок.
                </p>

                <div className="flex flex-col items-center mb-4">
                    <label htmlFor="iconUpload" className="w-24 h-24 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1e1f22]">
                        {iconFile ? (
                            <img src={URL.createObjectURL(iconFile)} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <UploadCloud className="w-6 h-6 text-gray-400" />
                        )}
                    </label>
                    <input
                        type="file"
                        id="iconUpload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                    />
                </div>

                <input
                    type="text"
                    placeholder="Название сервера"
                    className="w-full p-2 rounded-md bg-[#1e1f22] text-white placeholder-gray-400 mb-4 outline-none"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                />

                <button
                    onClick={handleSubmit}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-md transition"
                >
                    Создать
                </button>
            </div>
        </div>
    );
}