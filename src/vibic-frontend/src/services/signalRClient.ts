import * as signalR from '@microsoft/signalr';

const hubConnection = new signalR.HubConnectionBuilder()
    .withUrl('https://localhost:7138/hubs/chat', {
        accessTokenFactory: () => localStorage.getItem('access_token') || '',
    })
    // .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

export default hubConnection;