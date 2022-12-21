import { ClientToServerEvents, ServerToClientEvents } from "interfaces";
import { createContext } from "react";
import { Socket } from "socket.io-client";

export interface SocketContextProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  connected: boolean;
}

export const SocketContext = createContext<SocketContextProps>(undefined!);
