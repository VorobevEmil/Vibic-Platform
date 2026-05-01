import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ActiveVoiceSession, VoiceContext, VoiceUser } from '../../context/VoiceContext';
import { callHubConnection } from '../../services/signalRClient';
import { rtcConfiguration } from '../../utils/webrtcConfig';
import { useAuthContext } from '../../context/AuthContext';
import { useMedia } from '../../context/MediaContext';
import { useCallContext } from '../../context/CallContext';

interface Props {
    children: React.ReactNode;
}

export default function VoiceProvider({ children }: Props) {
    const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const streamRef = useRef<MediaStream | null>(null);
    const pendingIceCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
    const [voiceUsers, setVoiceUsers] = useState<VoiceUser[]>([]);
    const [voiceUsersByChannel, setVoiceUsersByChannel] = useState<Record<string, VoiceUser[]>>({});
    const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
    const [activeVoiceSession, setActiveVoiceSession] = useState<ActiveVoiceSession | null>(null);
    const { selfUser } = useAuthContext();
    const { isMicOn, isHeadphonesOn } = useMedia();
    const { isCallActive, endCall } = useCallContext();
    const isMicOnRef = useRef(isMicOn);
    isMicOnRef.current = isMicOn;
    const subscribedServerRef = useRef<string | null>(null);
    const voiceChannelIdsRef = useRef<string[]>([]);
    const lastJoinKeyRef = useRef<string | null>(null);
    const currentChannelIdRef = useRef<string | null>(null);
    const activeVoiceSessionRef = useRef<ActiveVoiceSession | null>(null);

    currentChannelIdRef.current = currentChannelId;
    activeVoiceSessionRef.current = activeVoiceSession;

    const ensureConnected = useCallback(async () => {
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
    }, []);

    const queueIceCandidate = useCallback((remoteUserId: string, candidate: RTCIceCandidateInit) => {
        const pendingCandidates = pendingIceCandidatesRef.current.get(remoteUserId) ?? [];
        pendingCandidates.push(candidate);
        pendingIceCandidatesRef.current.set(remoteUserId, pendingCandidates);
    }, []);

    const flushIceCandidates = useCallback(async (remoteUserId: string, pc: RTCPeerConnection) => {
        if (pc.signalingState === 'closed' || !pc.remoteDescription) {
            return;
        }

        const pendingCandidates = pendingIceCandidatesRef.current.get(remoteUserId);
        if (!pendingCandidates?.length) {
            return;
        }

        pendingIceCandidatesRef.current.delete(remoteUserId);
        for (const candidate of pendingCandidates) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.warn('Failed to add queued voice ICE candidate', error);
            }
        }
    }, []);

    const removeRemoteAudio = useCallback((remoteUserId: string) => {
        const audio = document.getElementById(`audio-${remoteUserId}`);
        if (audio) audio.remove();
    }, []);

    const clearVoiceSignalingHandlers = useCallback(() => {
        callHubConnection.off('VoiceChannelUsers');
        callHubConnection.off('UserJoinedVoice');
        callHubConnection.off('UserLeftVoice');
        callHubConnection.off('VoiceUserMicStatusChanged');
        callHubConnection.off('ReceiveVoiceOffer');
        callHubConnection.off('ReceiveVoiceAnswer');
        callHubConnection.off('ReceiveVoiceIceCandidate');
    }, []);

    const createPeerConnection = useCallback((remoteUserId: string): RTCPeerConnection => {
        peersRef.current.get(remoteUserId)?.close();
        removeRemoteAudio(remoteUserId);

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
                    scope: 'voice',
                }).catch(console.error);
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
                audio.style.display = 'none';
                document.body.appendChild(audio);
            }
            audio.srcObject = stream;
            audio.muted = !isHeadphonesOn;
        };

        peersRef.current.set(remoteUserId, pc);
        return pc;
    }, [isHeadphonesOn, removeRemoteAudio]);

    const sendVoiceOffer = useCallback(async (remoteUserId: string, displayName?: string) => {
        const pc = createPeerConnection(remoteUserId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await callHubConnection.invoke('SendOffer', {
            toUserId: remoteUserId,
            offer,
            scope: 'voice',
        });

        if (displayName) {
            console.log(`📤 Offer отправлен пользователю: ${displayName}`);
        }
    }, [createPeerConnection]);

    // leaveChannel определена первой, чтобы joinChannel могла её использовать
    const leaveChannel = useCallback(async () => {
        if (currentChannelIdRef.current && callHubConnection.state === 'Connected') {
            try {
                await callHubConnection.invoke('LeaveVoiceChannel');
            } catch (error) {
                console.warn('Failed to notify server about leaving voice channel', error);
            }
        }

        clearVoiceSignalingHandlers();
        setVoiceUsers([]);
        setCurrentChannelId(null);

        peersRef.current.forEach((pc, userId) => {
            pc.close();
            removeRemoteAudio(userId);
        });

        peersRef.current.clear();
        pendingIceCandidatesRef.current.clear();

        const localVideo = document.getElementById('video-local');
        if (localVideo) localVideo.remove();

        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        activeVoiceSessionRef.current = null;
        setActiveVoiceSession(null);
    }, [clearVoiceSignalingHandlers, removeRemoteAudio]); // стабильная ссылка — читает currentChannelId через ref

    const joinChannel = useCallback(async (channelId: string, serverId: string, channelName?: string | null) => {
        if (currentChannelIdRef.current === channelId) return;
        if (!selfUser) return;

        try {
            if (isCallActive) {
                endCall();
            }

            await leaveChannel();

            if (!streamRef.current) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getAudioTracks().forEach((track) => {
                    track.enabled = isMicOnRef.current;
                });
                streamRef.current = stream;
            }

            await ensureConnected();

            setCurrentChannelId(channelId);
            const nextVoiceSession = { serverId, channelId, channelName };
            activeVoiceSessionRef.current = nextVoiceSession;
            setActiveVoiceSession(nextVoiceSession);

            clearVoiceSignalingHandlers();

            callHubConnection.on('VoiceChannelUsers', async (users: VoiceUser[]) => {
                console.log('🟢 Получены пользователи канала:', users);
                setVoiceUsers(users);

                for (const user of users) {
                    if (!selfUser || user.userId === selfUser.id) continue;

                    const isInitiator = selfUser.id > user.userId;
                    if (!isInitiator) continue;

                    try {
                        await sendVoiceOffer(user.userId, user.displayName);
                    } catch (error) {
                        console.error(`Failed to send voice offer to ${user.displayName}`, error);
                    }
                }
            });

            callHubConnection.on('UserJoinedVoice', async (user: VoiceUser) => {
                if (!selfUser || user.userId === selfUser.id) return;

                console.log(`👋 Новый пользователь: ${user.displayName}`);
                setVoiceUsers(prev => [...prev.filter(u => u.userId !== user.userId), user]);

                const isInitiator = selfUser.id > user.userId;
                if (!isInitiator) return;

                try {
                    await sendVoiceOffer(user.userId, user.displayName);
                } catch (error) {
                    console.error(`Failed to send voice offer to joined user ${user.displayName}`, error);
                }
            });

            callHubConnection.on('VoiceUserMicStatusChanged', (userId: string, isMicOn: boolean) => {
                setVoiceUsers(prev => prev.map(u => u.userId === userId ? { ...u, isMicOn } : u));
            });

            callHubConnection.on('UserLeftVoice', (userId: string) => {
                console.log(`👋 Пользователь покинул канал: ${userId}`);
                setVoiceUsers(prev => prev.filter(u => u.userId !== userId));

                const pc = peersRef.current.get(userId);
                if (pc) {
                    pc.close();
                    peersRef.current.delete(userId);
                }

                pendingIceCandidatesRef.current.delete(userId);
                removeRemoteAudio(userId);
            });

            callHubConnection.on('ReceiveVoiceOffer', async (fromUserId: string, offer) => {
                console.log(`[ReceiveOffer] from: ${fromUserId}, selfUser: ${selfUser?.id}`);

                const pc = createPeerConnection(fromUserId);

                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                    await flushIceCandidates(fromUserId, pc);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    await callHubConnection.invoke('SendAnswer', {
                        toUserId: fromUserId,
                        answer,
                        scope: 'voice',
                    });
                } catch (error) {
                    console.error('Failed to handle voice offer', error);
                }
            });

            callHubConnection.on('ReceiveVoiceAnswer', async (fromUserId: string, answer) => {
                console.log('📥 Получен Answer от:', fromUserId);

                const pc = peersRef.current.get(fromUserId);
                if (!pc || !pc.localDescription) {
                    console.warn('⚠️ PeerConnection или localDescription не найден — игнорируем Answer');
                    return;
                }

                if (pc.signalingState === 'closed') {
                    console.warn('⚠️ Соединение уже закрыто, игнорируем Answer');
                    return;
                }

                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                    await flushIceCandidates(fromUserId, pc);
                    console.log('✅ Answer применён');
                } catch (err) {
                    console.error('❌ Ошибка установки Answer:', err);
                }
            });

            callHubConnection.on('ReceiveVoiceIceCandidate', async (fromUserId: string, candidate) => {
                console.log('📥 Получен ICE-кандидат от:', fromUserId);
                const pc = peersRef.current.get(fromUserId);
                if (!pc || pc.signalingState === 'closed' || !pc.remoteDescription) {
                    queueIceCandidate(fromUserId, candidate as RTCIceCandidateInit);
                    return;
                }

                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log('✅ ICE-кандидат успешно добавлен');
                } catch (err) {
                    console.warn('❌ Ошибка ICE-кандидата:', err);
                }
            });

            await callHubConnection.invoke('JoinVoiceChannel', channelId, serverId, selfUser.id, selfUser.displayName, selfUser.avatarUrl, isMicOnRef.current);
        } catch (error) {
            console.error('Failed to join voice channel', error);
            await leaveChannel();
        }
    }, [
        createPeerConnection,
        endCall,
        ensureConnected,
        flushIceCandidates,
        isCallActive,
        leaveChannel,
        queueIceCandidate,
        removeRemoteAudio,
        clearVoiceSignalingHandlers,
        selfUser,
        sendVoiceOffer,
    ]);

    const joinServer = useCallback(async (serverId: string, voiceChannelIds: string[]) => {
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

        subscribedServerRef.current = serverId;
        voiceChannelIdsRef.current = voiceChannelIds;
        lastJoinKeyRef.current = joinKey;

        await callHubConnection.invoke('JoinServer', serverId);

        if (voiceChannelIds.length > 0) {
            const data = await callHubConnection.invoke<Record<string, VoiceUser[]>>('GetVoiceUsers', voiceChannelIds);
            setVoiceUsersByChannel(data);
        }
    }, [ensureConnected]);

    const leaveServer = useCallback(async (serverId: string) => {
        await callHubConnection.invoke('LeaveServer', serverId);
        if (subscribedServerRef.current === serverId) {
            subscribedServerRef.current = null;
        }
        voiceChannelIdsRef.current = [];
        lastJoinKeyRef.current = null;
        setVoiceUsersByChannel({});
    }, []);

    // Sync mic track with isMicOn state and notify voice channel
    useEffect(() => {
        streamRef.current?.getAudioTracks().forEach((track) => {
            track.enabled = isMicOn;
        });

        if (currentChannelIdRef.current) {
            callHubConnection.invoke('NotifyVoiceMicStatusChanged', isMicOn).catch(console.error);
        }
    }, [isMicOn]);

    // Mute/unmute all remote audio elements when headphones toggled
    useEffect(() => {
        peersRef.current.forEach((_, userId) => {
            const audio = document.getElementById(`audio-${userId}`) as HTMLAudioElement | null;
            if (audio) {
                audio.muted = !isHeadphonesOn;
            }
        });
    }, [isHeadphonesOn]);

    useEffect(() => {
        return () => {
            leaveChannel();
        };
    }, [leaveChannel]);

    useEffect(() => {
        const handleReconnected = async () => {
            try {
                if (activeVoiceSessionRef.current && selfUser) {
                    const voiceSession = activeVoiceSessionRef.current;

                    await callHubConnection.invoke(
                        'JoinVoiceChannel',
                        voiceSession.channelId,
                        voiceSession.serverId,
                        selfUser.id,
                        selfUser.displayName,
                        selfUser.avatarUrl,
                        isMicOnRef.current,
                    );
                }

                if (!subscribedServerRef.current) return;

                await callHubConnection.invoke('JoinServer', subscribedServerRef.current);
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
    }, [selfUser]);

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

        const handleMicStatusChanged = (channelId: string, userId: string, isMicOn: boolean) => {
            setVoiceUsersByChannel((prev) => {
                const current = prev[channelId] ?? [];
                return { ...prev, [channelId]: current.map(u => u.userId === userId ? { ...u, isMicOn } : u) };
            });
        };

        callHubConnection.off('VoiceChannelUserJoined');
        callHubConnection.off('VoiceChannelUserLeft');
        callHubConnection.off('VoiceChannelUserMicStatusChanged');
        callHubConnection.on('VoiceChannelUserJoined', handleUserJoined);
        callHubConnection.on('VoiceChannelUserLeft', handleUserLeft);
        callHubConnection.on('VoiceChannelUserMicStatusChanged', handleMicStatusChanged);

        return () => {
            callHubConnection.off('VoiceChannelUserJoined');
            callHubConnection.off('VoiceChannelUserLeft');
            callHubConnection.off('VoiceChannelUserMicStatusChanged');
        };
    }, []);

    const contextValue = useMemo(() => ({
        joinChannel,
        leaveChannel,
        joinServer,
        leaveServer,
        voiceUsers,
        voiceUsersByChannel,
        currentChannelId,
        activeVoiceSession,
    }), [joinChannel, leaveChannel, joinServer, leaveServer, voiceUsers, voiceUsersByChannel, currentChannelId, activeVoiceSession]);

    return (
        <VoiceContext.Provider value={contextValue}>
            {children}
        </VoiceContext.Provider>
    );
}
