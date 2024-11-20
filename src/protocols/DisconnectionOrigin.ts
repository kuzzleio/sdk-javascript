export enum DisconnectionOrigin {
  WEBSOCKET_AUTH_RENEWAL = "websocket/auth-renewal",
  USER_CONNECTION_CLOSED = "user/connection-closed",
  NETWORK_ERROR = "network/error",
  PAYLOAD_MAX_SIZE_EXCEEDED = "payload/max-size-exceeded",
}
