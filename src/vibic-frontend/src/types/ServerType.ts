export interface ServerRequest  {
    name: string
}

export interface ServerResponse extends ServerRequest {
    id: string,
    iconUrl: string,
    channelId: string
}