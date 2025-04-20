import * as signalR from '@microsoft/signalr';

enum SignalRConnectionType  {
    ChatChannel,
    Call
}

function createHubConnection(connectionType: SignalRConnectionType): signalR.HubConnection {
    var hubUrl = ''; 
    switch (connectionType) {
        case SignalRConnectionType.ChatChannel:
            hubUrl = 'https://localhost:7138/hubs/chat';
            break;
        case SignalRConnectionType.Call:
            hubUrl = 'https://localhost:7139/hubs/call';
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
