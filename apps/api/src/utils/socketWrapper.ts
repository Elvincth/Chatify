//A middleware wrapper to use express middleware with socket.io
//See: https://socket.io/docs/v4/middlewares/#compatibility-with-express-middleware

import { Socket } from "socket.io";

export const socketWrapper = (middleware: any) => {
  return (socket: Socket, next: any) => middleware(socket.request, {}, next);
};
