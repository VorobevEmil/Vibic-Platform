import * as signalR from '@microsoft/signalr';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7157';

export const notificationHubConnection = new signalR.HubConnectionBuilder()
  .withUrl(`${apiBaseUrl}/hubs/notifications`, {
    accessTokenFactory: () => localStorage.getItem('access_token') || '',
  })
  .withAutomaticReconnect()
  .configureLogging(import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Error)
  .build();
