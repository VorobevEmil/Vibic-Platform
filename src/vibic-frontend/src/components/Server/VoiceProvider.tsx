import React, { useRef, useState, useEffect } from 'react';
import { VoiceContext } from '../../context/VoiceContext';
import { callHubConnection } from '../../services/signalRClient';
import { rtcConfiguration } from '../../utils/webrtcConfig';
import { useAuthContext } from '../../context/AuthContext';

interface Props {
    children: React.ReactNode;
}

interface VoiceUser {
    userId: string;
    displayName: string;
    avatarUrl?: string | null;
}

export default function VoiceProvider({ children }: Props) {
    const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const streamRef = useRef<MediaStream | null>(null);
    const [voiceUsers, setVoiceUsers] = useState<VoiceUser[]>([]);
    const [voiceUsersByChannel, setVoiceUsersByChannel] = useState<Record<string, VoiceUser[]>>({});
    const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
    const { selfUser } = useAuthContext();
    const currentServerRef = useRef<string | null>(null);
    const voiceChannelIdsRef = useRef<string[]>([]);
    const lastJoinKeyRef = useRef<string | null>(null);

    const ensureConnected = async () => {
        if (callHubConnection.state === 'Connected') return;

        if (callHubConnection.state === 'Disconnected') {
            await callHubConnection.start();
            return;
        }

        await new Promise<void>((resolve, reject) => {
            const startedAt = Date.now();
            const timer = setInterval(() => {
                if (callHubConnection.state === 'Connected') {
                    clearInterval(timer);
                    resolve();
                } else if (Date.now() - startedAt > 5000) {
                    clearInterval(timer);
                    reject(new Error('CallHub connection timeout'));
                }
            }, 100);
        });
    };

    const createPeerConnection = (remoteUserId: string): RTCPeerConnection => {
        const pc = new RTCPeerConnection(rtcConfiguration);

        streamRef.current?.getTracks().forEach((track) => {
            pc.addTrack(track, streamRef.current!);
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(`ICE candidate to: ${remoteUserId}`);
                callHubConnection.invoke('SendIceCandidate', {
                    toUserId: remoteUserId,
                    candidate: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            console.log('📥 Получен remote track:', event.track);

            const stream = event.streams?.[0] || new MediaStream([event.track]);

            let audio = document.getElementById(`audio-${remoteUserId}`) as HTMLAudioElement;
            if (!audio) {
                audio = document.createElement('audio');
                audio.id = `audio-${remoteUserId}`;
                audio.autoplay = true;
                audio.controls = true;
                audio.style.display = 'none';
                document.body.appendChild(audio);
            }
            audio.srcObject = stream;
        };

        peersRef.current.set(remoteUserId, pc);
        return pc;
    };

    const joinChannel = async (channelId: string, serverId: string) => {
        if (currentChannelId === channelId) return;

        await leaveChannel();
        setCurrentChannelId(channelId);
        currentServerRef.current = serverId;

        if (!streamRef.current) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
        }

        await ensureConnected();

        callHubConnection.off('VoiceChannelUsers');
        callHubConnection.off('UserJoinedVoice');
        callHubConnection.off('UserLeftVoice');
        callHubConnection.off('ReceiveOffer');
        callHubConnection.off('ReceiveAnswer');
        callHubConnection.off('ReceiveIceCandidate');

        callHubConnection.on('VoiceChannelUsers', async (users: VoiceUser[]) => {
            console.log('🟢 Получены пользователи канала:', users);
            setVoiceUsers(users);

            for (const user of users) {
                if (!selfUser || user.userId === selfUser.id) continue;

                const isInitiator = selfUser.id > user.userId;
                if (!isInitiator) continue;

                const pc = createPeerConnection(user.userId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                await callHubConnection.invoke('SendOffer', {
                    toUserId: user.userId,
                    offer,
                });

                console.log(`📤 Offer отправлен пользователю: ${user.displayName}`);
            }
        });

        callHubConnection.on('UserJoinedVoice', async (user: VoiceUser) => {
            if (!selfUser || user.userId === selfUser.id) return;

            console.log(`👋 Новый пользователь: ${user.displayName}`);
            setVoiceUsers(prev => [...prev.filter(u => u.userId !== user.userId), user]);

            const isInitiator = selfUser.id > user.userId;
            if (!isInitiator) return;

            const pc = createPeerConnection(user.userId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            await callHubConnection.invoke('SendOffer', {
                toUserId: user.userId,
                offer,
            });

            console.log(`📤 Offer отправлен (по UserJoinedVoice) пользователю: ${user.displayName}`);
        });

        callHubConnection.on('UserLeftVoice', (userId: string) => {
            console.log(`👋 Пользователь покинул канал: ${userId}`);
            setVoiceUsers(prev => prev.filter(u => u.userId !== userId));

            const pc = peersRef.current.get(userId);
            if (pc) {
                pc.close();
                peersRef.current.delete(userId);
            }

            const audio = document.getElementById(`audio-${userId}`);
            if (audio) audio.remove();
        });

        callHubConnection.on('ReceiveOffer', async (fromUserId: string, offer) => {
            console.log(`[ReceiveOffer] from: ${fromUserId}, selfUser: ${selfUser?.id}`);

            let pc = peersRef.current.get(fromUserId);
            if (!pc) {
                pc = createPeerConnection(fromUserId);
            }

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            await callHubConnection.invoke('SendAnswer', {
                toUserId: fromUserId,
                answer,
            });
        });

        callHubConnection.on('ReceiveAnswer', async (fromUserId: string, answer) => {
            console.log('📥 Получен Answer от:', fromUserId);

            let pc = peersRef.current.get(fromUserId);
            if (!pc) {
                console.warn('⚠️ PeerConnection не найден — создаём вручную');
                pc = createPeerConnection(fromUserId);
            }

            if (pc.signalingState === 'closed') {
                console.warn('⚠️ Соединение уже закрыто, игнорируем Answer');
                return;
            }

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                console.log('✅ Answer применён');
            } catch (err) {
                console.error('❌ Ошибка установки Answer:', err);
            }
        });

        callHubConnection.on('ReceiveIceCandidate', async (fromUserId: string, candidate) => {
            console.log('📥 Получен ICE-кандидат от:', fromUserId);
            const pc = peersRef.current.get(fromUserId);
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate)).then(() => {
                        console.log("✅ ICE-кандидат успешно добавлен");
                    }).catch(err => {
                        console.error("❌ Ошибка ICE-кандидата:", err);
                    });
                } catch (err) {
                    console.warn('❌ Ошибка ICE-кандидата:', err);
                }
            }
        });

        await callHubConnection.invoke('JoinVoiceChannel', channelId, serverId, selfUser?.id, selfUser?.displayName, selfUser?.avatarUrl);
    };

    const joinServer = async (serverId: string, voiceChannelIds: string[]) => {
        const joinKey = `${serverId}|${voiceChannelIds.join(',')}`;
        if (lastJoinKeyRef.current === joinKey) {
            return;
        }

        try {
            await ensureConnected();
        } catch (err) {
            console.error('❌ Ошибка подключения к CallHub:', err);
            return;
        }

        currentServerRef.current = serverId;
        voiceChannelIdsRef.current = voiceChannelIds;
        lastJoinKeyRef.current = joinKey;

        await callHubConnection.invoke('JoinServer', serverId);

        if (voiceChannelIds.length > 0) {
            const data = await callHubConnection.invoke<Record<string, VoiceUser[]>>('GetVoiceUsers', voiceChannelIds);
            setVoiceUsersByChannel(data);
        }
    };

    const leaveServer = async (serverId: string) => {
        await callHubConnection.invoke('LeaveServer', serverId);
        if (currentServerRef.current === serverId) {
            currentServerRef.current = null;
        }
        voiceChannelIdsRef.current = [];
        lastJoinKeyRef.current = null;
        setVoiceUsersByChannel({});
    };

    const leaveChannel = async () => {
        if (currentChannelId) {
            await callHubConnection.invoke('LeaveVoiceChannel');
        }

        setVoiceUsers([]);
        setCurrentChannelId(null);

        peersRef.current.forEach((pc, userId) => {
            pc.close();
            const video = document.getElementById(`video-${userId}`);
            if (video) video.remove();
        });

        peersRef.current.clear();

        const localVideo = document.getElementById('video-local');
        if (localVideo) localVideo.remove();

        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
    };

    useEffect(() => {
        return () => {
            leaveChannel();
            callHubConnection.stop();
        };
    }, []);

    useEffect(() => {
        const handleReconnected = async () => {
            if (!currentServerRef.current) return;

            try {
                await callHubConnection.invoke('JoinServer', currentServerRef.current);
                if (voiceChannelIdsRef.current.length > 0) {
                    const data = await callHubConnection.invoke<Record<string, VoiceUser[]>>(
                        'GetVoiceUsers',
                        voiceChannelIdsRef.current
                    );
                    setVoiceUsersByChannel(data);
                }
            } catch (err) {
                console.error('❌ Ошибка при переподключении к CallHub:', err);
            }
        };

        callHubConnection.onreconnected(handleReconnected);

        return () => {
            callHubConnection.off('reconnected', handleReconnected);
        };
    }, []);

    useEffect(() => {
        const handleUserJoined = (channelId: string, user: VoiceUser) => {
            setVoiceUsersByChannel((prev) => {
                const current = prev[channelId] ?? [];
                const next = [...current.filter(u => u.userId !== user.userId), user];
                return { ...prev, [channelId]: next };
            });
        };

        const handleUserLeft = (channelId: string, userId: string) => {
            setVoiceUsersByChannel((prev) => {
                const current = prev[channelId] ?? [];
                return { ...prev, [channelId]: current.filter(u => u.userId !== userId) };
            });
        };

        callHubConnection.off('VoiceChannelUserJoined');
        callHubConnection.off('VoiceChannelUserLeft');
        callHubConnection.on('VoiceChannelUserJoined', handleUserJoined);
        callHubConnection.on('VoiceChannelUserLeft', handleUserLeft);

        return () => {
            callHubConnection.off('VoiceChannelUserJoined');
            callHubConnection.off('VoiceChannelUserLeft');
        };
    }, []);

    return (
        <VoiceContext.Provider value={{ joinChannel, leaveChannel, joinServer, leaveServer, voiceUsers, voiceUsersByChannel, currentChannelId }}>
            {children}
        </VoiceContext.Provider>
    );
}
