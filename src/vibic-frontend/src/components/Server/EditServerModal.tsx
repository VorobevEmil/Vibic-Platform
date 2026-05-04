import { useCallback, useState } from 'react';
import { Hash, Lock, Pencil, UploadCloud, Volume2, X } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { resolveAssetUrl } from '../../api/httpClient';
import { ChannelType } from '../../types/enums/ChannelType';
import { ServerChannelResponse, ServerMemberResponse } from '../../types/ServerType';
import EditChannelModal from './EditChannelModal';

interface EditServerModalProps {
  serverId: string;
  currentName: string;
  currentIconUrl?: string | null;
  channels: ServerChannelResponse[];
  serverMembers: ServerMemberResponse[];
  onClose: () => void;
  onSave: (name: string, iconFile: File | null) => Promise<void>;
  onDelete: () => Promise<void>;
  onUpdateChannel: (channelId: string, name: string, isPublic: boolean, memberIds: string[]) => Promise<void>;
  onDeleteChannel: (channelId: string) => Promise<void>;
}

export default function EditServerModal({
  serverId,
  currentName,
  currentIconUrl,
  channels,
  serverMembers,
  onClose,
  onSave,
  onDelete,
  onUpdateChannel,
  onDeleteChannel,
}: EditServerModalProps) {
  const [serverName, setServerName] = useState(currentName);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ServerChannelResponse | null>(null);

  const onCropComplete = useCallback((_: Area, area: Area) => {
    setCroppedAreaPixels(area);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

      await onSave(serverName.trim(), finalIconFile);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Вы уверены, что хотите удалить сервер "${currentName}"? Это действие необратимо.`);

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    try {
      await onDelete();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#171b27] p-6 text-white shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-5">
            <h2 className="text-2xl font-bold">Настройки сервера</h2>
            <p className="mt-1 text-sm text-gray-400">
              Измените оформление сервера и управляйте существующими каналами.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="space-y-4 rounded-2xl border border-white/8 bg-[#23252b] p-4">
              <div className="flex flex-col items-center">
                {!imageSrc ? (
                  <>
                    <label
                      htmlFor="iconUpload"
                      className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/15 transition hover:bg-[#0e1016]"
                    >
                      {currentIconUrl ? (
                        <img
                          src={resolveAssetUrl(currentIconUrl)}
                          alt="icon"
                          className="absolute inset-0 h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <UploadCloud className="h-6 w-6 text-gray-400" />
                      )}
                    </label>
                    <input
                      type="file"
                      id="iconUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <p className="mt-2 text-xs text-gray-400">Нажмите, чтобы сменить иконку</p>
                  </>
                ) : (
                  <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-black">
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

              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Название сервера</label>
                <input
                  type="text"
                  placeholder="Название сервера"
                  className="w-full rounded-xl bg-[#0e1016] p-2.5 text-sm text-white outline-none ring-1 ring-transparent transition focus:ring-indigo-500/60"
                  value={serverName}
                  onChange={(event) => setServerName(event.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading || !serverName.trim()}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Сохранить
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Удалить
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Каналы сервера</h3>
                  <p className="text-sm text-gray-400">
                    Редактируйте название, приватность и удаляйте ненужные каналы.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-300">
                  {channels.length}
                </div>
              </div>

              <div className="space-y-2">
                {channels.map((channel) => {
                  const isTextChannel = channel.channelType === ChannelType.Server;

                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setEditingChannel(channel)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-[#23252b] px-4 py-3 text-left transition hover:border-white/15 hover:bg-[#2a2d35]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-indigo-300">
                        {isTextChannel ? <Hash className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">{channel.name}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                          <span>{isTextChannel ? 'Текстовый' : 'Голосовой'}</span>
                          <span className="text-gray-600">•</span>
                          <span className="inline-flex items-center gap-1">
                            {!channel.isPublic && <Lock className="h-3.5 w-3.5 text-amber-300" />}
                            {channel.isPublic ? 'Публичный' : 'Приватный'}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white/5 p-2 text-gray-300">
                        <Pencil className="h-4 w-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {editingChannel && (
        <EditChannelModal
          serverId={serverId}
          channel={editingChannel}
          serverMembers={serverMembers}
          onClose={() => setEditingChannel(null)}
          onSave={(name, isPublic, memberIds) => onUpdateChannel(editingChannel.id, name, isPublic, memberIds)}
          onDelete={() => onDeleteChannel(editingChannel.id)}
        />
      )}
    </>
  );
}
