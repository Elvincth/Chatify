import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import jwt from "jsonwebtoken";
import { getJWTPublicKey } from "~/utils/jwt";
import { SocketError } from "interfaces";

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) => {
  let authenticated = false;

  if (socket.request.headers.authorization) {
    //Get bearer token from authorization header
    const token = socket.request.headers.authorization.split(" ")[1];
    try {
      //Verify token
      const decoded = jwt.verify(token, getJWTPublicKey(), {
        algorithms: ["RS256"],
      });

      if (decoded) {
        authenticated = true;
      }
    } catch (e) {
      authenticated = false;
    }
  }

  //If the user not authenticated, throw error
  if (authenticated) {
    return next();
  }

  console.log("[Socket Auth]: User not authenticated");

  socket.emit("error", SocketError.ERR_UNAUTHORIZED);
  return next(new Error(SocketError.ERR_UNAUTHORIZED));
};
