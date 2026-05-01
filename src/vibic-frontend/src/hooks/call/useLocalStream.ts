import { useEffect, useRef } from 'react';

export default function useLocalStream(videoRef: React.RefObject<HTMLVideoElement | null>) {
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('🚫 Не удалось получить доступ к камере/микрофону:', err);
            }
        };

        init();

        return () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, [videoRef]);

    return streamRef;
}
