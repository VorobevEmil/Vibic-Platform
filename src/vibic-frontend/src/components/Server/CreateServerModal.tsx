import { useState, useCallback } from 'react';
import { X, UploadCloud } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

interface CreateServerModalProps {
    onClose: () => void;
    onCreate: (name: string, iconFile: File | null) => void;
}

export default function CreateServerModal({ onClose, onCreate }: CreateServerModalProps) {
    const [serverName, setServerName] = useState('');
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

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

    const handleCreate = async () => {
        if (!serverName.trim()) return;
        let finalIconFile = iconFile;
        if (imageSrc && !iconFile && croppedAreaPixels) {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            finalIconFile = new File([croppedBlob], 'server-icon.jpg', { type: 'image/jpeg' });
            setIconFile(finalIconFile);
        }
        onCreate(serverName, finalIconFile);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#171b27] text-white p-6 rounded-lg shadow-lg w-[400px] relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-4">Персонализируйте свой сервер</h2>
                <p className="text-sm text-gray-400 mb-4">
                    Персонализируйте свой новый сервер, выбрав ему название и значок.
                </p>

                <div className="flex flex-col items-center mb-4">
                    {!imageSrc ? (
                        <>
                            <label htmlFor="iconUpload" className="w-24 h-24 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:bg-[#0e1016]">
                                <UploadCloud className="w-6 h-6 text-gray-400" />
                            </label>
                            <input
                                type="file"
                                id="iconUpload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
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
                    className="w-full p-2 rounded-md bg-[#0e1016] text-white placeholder-gray-400 mb-4 outline-none"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                />

                <button
                    onClick={handleCreate}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-md transition"
                >
                    Создать
                </button>
            </div>
        </div>
    );
}
