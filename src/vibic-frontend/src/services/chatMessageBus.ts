import { chatHubConnection } from './signalRClient';
import MessageResponse from '../types/MessageType';

type MsgHandler = (msg: MessageResponse) => void;
type DeletedHandler = (payload: { messageId: string; channelId: string }) => void;
type EditedHandler = (msg: MessageResponse) => void;
type ReactionUpdatedHandler = (msg: MessageResponse) => void;

const msgHandlers = new Set<MsgHandler>();
const deletedHandlers = new Set<DeletedHandler>();
const editedHandlers = new Set<EditedHandler>();
const reactionUpdatedHandlers = new Set<ReactionUpdatedHandler>();
let initialized = false;

function init() {
    if (initialized) return;
    initialized = true;
    chatHubConnection.on('ReceiveMessage', (msg: MessageResponse) => {
        msgHandlers.forEach(h => h(msg));
    });
    chatHubConnection.on('MessageDeleted', (payload: { messageId: string; channelId: string }) => {
        deletedHandlers.forEach(h => h(payload));
    });
    chatHubConnection.on('MessageEdited', (msg: MessageResponse) => {
        editedHandlers.forEach(h => h(msg));
    });
    chatHubConnection.on('MessageReactionUpdated', (msg: MessageResponse) => {
        reactionUpdatedHandlers.forEach(h => h(msg));
    });
}

export const chatMessageBus = {
    onMessage(handler: MsgHandler): () => void {
        init();
        msgHandlers.add(handler);
        return () => msgHandlers.delete(handler);
    },
    onDeleted(handler: DeletedHandler): () => void {
        init();
        deletedHandlers.add(handler);
        return () => deletedHandlers.delete(handler);
    },
    onEdited(handler: EditedHandler): () => void {
        init();
        editedHandlers.add(handler);
        return () => editedHandlers.delete(handler);
    },
    onReactionUpdated(handler: ReactionUpdatedHandler): () => void {
        init();
        reactionUpdatedHandlers.add(handler);
        return () => reactionUpdatedHandlers.delete(handler);
    },
};
