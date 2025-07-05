import * as signalR from '@microsoft/signalr';

enum SignalRConnectionType  {
    ChatChannel,
    Call
}

function createHubConnection(connectionType: SignalRConnectionType): signalR.HubConnection {
    var hubUrl = ''; 
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7157';
    switch (connectionType) {
        case SignalRConnectionType.ChatChannel:
            hubUrl = `${apiBaseUrl}/hubs/chat`;
            break;
        case SignalRConnectionType.Call:
            hubUrl = `${apiBaseUrl}/hubs/call`;
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

export const chatHubConnection = createHubConnection(SignalRConnectionType.ChatChannel);
export const callHubConnection = createHubConnection(SignalRConnectionType.Call);
