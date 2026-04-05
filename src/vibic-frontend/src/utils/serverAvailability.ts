export const SERVER_AVAILABILITY_EVENT = 'vibic:server-availability-changed';

export type ServerAvailabilityReason = 'server_unreachable' | 'offline';

export interface ServerAvailabilityDetail {
  available: boolean;
  reason?: ServerAvailabilityReason;
}

export function notifyServerAvailability(detail: ServerAvailabilityDetail) {
  window.dispatchEvent(new CustomEvent<ServerAvailabilityDetail>(SERVER_AVAILABILITY_EVENT, {
    detail,
  }));
}
