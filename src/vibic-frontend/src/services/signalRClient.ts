import * as signalR from '@microsoft/signalr';

enum SignalRConnectionType  {
    ChatChannel,
    Call,
    Presence
}

function createHubConnection(connectionType: SignalRConnectionType): signalR.HubConnection {
    let hubUrl = '';
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7157';
    switch (connectionType) {
        case SignalRConnectionType.ChatChannel:
            hubUrl = `${apiBaseUrl}/hubs/chat`;
            break;
        case SignalRConnectionType.Call:
            hubUrl = `${apiBaseUrl}/hubs/call`;
            break;
        case SignalRConnectionType.Presence:
            hubUrl = `${apiBaseUrl}/hubs/presence`;
            break;
        default:
            break;
    }
    
  return new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => localStorage.getItem('access_token') || '',
    })
    .withAutomaticReconnect()
    .configureLogging(import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Error)
    .build();
}

async function stopHubConnection(connection: signalR.HubConnection) {
  if (connection.state !== signalR.HubConnectionState.Disconnected) {
    await connection.stop();
  }
}

export const chatHubConnection = createHubConnection(SignalRConnectionType.ChatChannel);
export const callHubConnection = createHubConnection(SignalRConnectionType.Call);
export const presenceHubConnection = createHubConnection(SignalRConnectionType.Presence);

export async function stopRealtimeConnections() {
  await Promise.allSettled([
    stopHubConnection(chatHubConnection),
    stopHubConnection(callHubConnection),
    stopHubConnection(presenceHubConnection),
  ]);
}
