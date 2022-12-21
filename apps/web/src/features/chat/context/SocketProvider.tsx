
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '~/features/auth';
import { SocketContext } from './SocketContext';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URI);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  //const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(socket.connected);
  const { accessToken } = useAuth();
  let init = false;

  useEffect(() => {
    if (!init) {
      socket.on('connect', () => {
        console.log('connected');
        setConnected(true);
      });


      socket.on('disconnect', () => {
        console.log('disconnected');
        setConnected(false);
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
      init = true;
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);


  //If we detect the access token has changed, we disconnect the socket
  useEffect(() => {
    if (socket) {
      //Change the extra headers
      socket.io.opts.extraHeaders = {
        Authorization: `Bearer ${accessToken}`,
      };

      //Reconnect the socket
      socket.disconnect().connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);



  return <>
    <SocketContext.Provider value={{
      socket,
      connected
    }}>
      {children}
    </SocketContext.Provider>
  </>
};