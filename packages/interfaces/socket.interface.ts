import { Server, Socket } from "socket.io";

export enum SocketError {
  ERR_UNAUTHORIZED = "ERR_UNAUTHORIZED",
  ERR_INVALID = "ERR_INVALID",
  ERR_EXPIRED = "ERR_EXPIRED",
  ERR_UNKNOWN = "ERR_UNKNOWN",
}

export interface SocketException {
  message: string;
}

export interface Message {
  content: string;
  /**
   * The sender's encrypted content
   * as the sender needs to be able to decrypt the message
   * and read it back
   */
  senderContent: string;
  conversationId: string;
}

export interface SendMessageData extends Message {
  receiverId: string;
}

export interface GetMessageData extends Message {
  senderId: string;
}

export interface ServerToClientEvents {
  exception: (data: SocketException) => void;
  getMessage: (data: GetMessageData) => void;
}

export interface ClientToServerEvents {
  sendMessage: (data: SendMessageData) => void;
}

export interface InterServerEvents {}

export interface SocketData {}

export type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type SocketClient = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
