import { useState, useCallback } from 'react';
import { X, UploadCloud } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { resolveAssetUrl } from '../../api/httpClient';

interface EditServerModalProps {
    currentName: string;
    currentIconUrl?: string | null;
    onClose: () => void;
    onSave: (name: string, iconFile: File | null) => Promise<void>;
    onDelete: () => Promise<void>;
}

export default function EditServerModal({ currentName, currentIconUrl, onClose, onSave, onDelete }: EditServerModalProps) {
    const [serverName, setServerName] = useState(currentName);
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onCropComplete = useCallback((_: Area, area: Area) => {
        setCroppedAreaPixels(area);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setIconFile(null);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!serverName.trim()) return;
        setIsLoading(true);
        try {
            let finalIconFile = iconFile;
            if (imageSrc && !iconFile && croppedAreaPixels) {
                const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
                finalIconFile = new File([croppedBlob], 'server-icon.jpg', { type: 'image/jpeg' });
            }
            await onSave(serverName, finalIconFile);
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Вы уверены, что хотите удалить сервер "${currentName}"? Это действие необратимо.`)) return;
        setIsLoading(true);
        try {
            await onDelete();
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#2b2d31] text-white p-6 rounded-lg shadow-lg w-[400px] relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-4">Настройки сервера</h2>

                <div className="flex flex-col items-center mb-4">
                    {!imageSrc ? (
                        <>
                            <label htmlFor="iconUpload" className="w-24 h-24 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1e1f22] overflow-hidden relative">
                                {currentIconUrl ? (
                                    <img
                                        src={resolveAssetUrl(currentIconUrl)}
                                        alt="icon"
                                        className="absolute inset-0 w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <UploadCloud className="w-6 h-6 text-gray-400" />
                                )}
                            </label>
                            <input
                                type="file"
                                id="iconUpload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-gray-400 mt-2">Нажмите для смены иконки</p>
                        </>
                    ) : (
                        <div className="relative w-full h-64 bg-black">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                    )}
                </div>

                <input
                    type="text"
                    placeholder="Название сервера"
                    className="w-full p-2 rounded-md bg-[#1e1f22] text-white placeholder-gray-400 mb-4 outline-none"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                />

                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-md transition mb-2"
                >
                    Сохранить
                </button>

                <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-2 rounded-md transition"
                >
                    Удалить сервер
                </button>
            </div>
        </div>
    );
}
