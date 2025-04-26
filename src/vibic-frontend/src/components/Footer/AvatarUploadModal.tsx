import { useRef, useState, useCallback } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

interface Props {
  currentAvatar: string;
  onClose: () => void;
  onSave: (file: File | null) => void;
}

export default function AvatarUploadModal({ currentAvatar, onClose, onSave }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });

      onSave(croppedFile);
      onClose();
    } catch (error) {
      console.error('Ошибка обрезки изображения:', error);
    }
  };

  const handleDelete = () => {
    setImageSrc(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-[#2b2d31] rounded-lg p-6 w-[400px] text-white relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Настроить аватар</h2>

        {!imageSrc ? (
          <div className="flex flex-col items-center">
            <img
              src={currentAvatar}
              alt="current-avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-white"
            />

            <input
              type="file"
              accept="image/*"
              ref={inputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex gap-6 mt-4">
              <button
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <Upload className="w-4 h-4" />
                Загрузить
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 text-sm text-red-400 hover:underline"
              >
                <Trash2 className="w-4 h-4" />
                Удалить
              </button>
            </div>
          </div>
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

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={!imageSrc}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded disabled:opacity-50"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
