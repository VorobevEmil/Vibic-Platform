import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Phone, Settings, Video } from 'lucide-react';
import useDirectChannel from '../../../hooks/chat/useDirectChannel';
import useSignalRChannel from '../../../hooks/chat/useSignalRChannel';
import { useChatMessages } from '../../../hooks/chat/useChatMessages';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import CallPanel from '../../Call/CallPanel';
import CallRequestType from '../../../types/CallRequestType';
import { chatHubConnection } from '../../../services/signalRClient';
import { useAuthContext } from '../../../context/AuthContext';

interface Props {
  channelId: string;
}

export default function DirectChatCenterPanel({ channelId }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { isIncomingCall?: boolean; callData?: CallRequestType; } | null;

  const selfUser = useAuthContext();
  const [inputValue, setInputValue] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callRequest, setCallRequest] = useState<CallRequestType | null>(null);
  const peerUser = useDirectChannel(channelId, selfUser?.id);

  const {
    messages,
    setMessages,
    messagesEndRef,
    scrollContainerRef,
    isLoadingMore,
    loadMoreMessages,
    initializeMessages,
    scrollToBottom
  } = useChatMessages(channelId);

  const { sendMessage, connected, typingUsername } = useSignalRChannel(channelId, setMessages);

  const handleSend = async () => {
    if (!inputValue.trim() || !connected || !selfUser) return;

    await sendMessage({
      channelId,
      content: inputValue,
    });

    setInputValue('');
    setTimeout(scrollToBottom, 50);
  };

  const handleTyping = () => {
    if (chatHubConnection.state === 'Connected' && selfUser?.username) {
      chatHubConnection.invoke('SendTypingStatus', channelId, selfUser.username);
    }
  };

  const handleStartCall = (startWithCam : boolean) => {
    if (!peerUser || !selfUser) return;

    setCallRequest({
      peerUserId: peerUser.id,
      peerUsername: peerUser.username,
      peerAvatarUrl: peerUser.avatarUrl,
      initiatorUsername: selfUser.username,
      initiatorAvatarUrl: selfUser.avatarUrl,
      channelId,
      isInitiator: true,
      isCamOn: startWithCam,
    });

    setIsCalling(true);
  };

  useEffect(() => {
    initializeMessages();
  }, [channelId]);

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;
    const onScroll = () => scrollEl.scrollTop === 0 && loadMoreMessages();
    scrollEl.addEventListener('scroll', onScroll);
    return () => scrollEl.removeEventListener('scroll', onScroll);
  }, [loadMoreMessages]);

  useEffect(() => {
    if (state?.isIncomingCall && state.callData) {
      setIsCalling(true);
      setCallRequest(state.callData);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [state]);

  return (
    <div className="relative flex flex-col flex-1 h-full bg-[#313338]">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#1e1f22]">
        <div className="flex items-center gap-3">
          {peerUser && (
            <>
              <img src={peerUser.avatarUrl} className="w-8 h-8 rounded-full" />
              <span className="font-bold text-white text-lg">{peerUser.username}</span>
            </>
          )}
        </div>
        <div className="flex gap-4 text-gray-300">
          <Phone className="hover:text-white cursor-pointer w-5 h-5" onClick={() => handleStartCall(false)} />
          <Video className="hover:text-white cursor-pointer w-5 h-5" onClick={() => handleStartCall(true)} />
          <Settings className="hover:text-white cursor-pointer w-5 h-5" />
        </div>
      </div>

      {isCalling && callRequest && (
        <CallPanel onClose={() => setIsCalling(false)} callRequest={callRequest} />
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" ref={scrollContainerRef}>
        <ChatMessages
          messages={messages}
          typingUsername={typingUsername}
          messagesEndRef={messagesEndRef}
          isLoadingMore={isLoadingMore}
        />
      </div>

      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSend={handleSend}
        handleTyping={handleTyping}
        placeholder={peerUser ? `Написать @${peerUser.username}` : 'Загрузка...'}
      />
    </div>
  );
}