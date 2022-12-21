import { SocketClient, SocketServer } from "interfaces";
import { Socket } from "socket.io";
import { verifyJWT } from "~/utils/jwt";

//key value pair of  user id and socket.id
const users: {
  [socketId: string]: string;
} = {};

const addUser = (socketId: string, userId: string) => {
  users[socketId] = userId;
};

const removeUser = (socketId: string) => {
  delete users[socketId];
};

export const handleSocketEvents = (socket: SocketClient, io: SocketServer) => {
  //Handle connected
  handleConnectEvent(socket, io);

  //chat
  socket.on("sendMessage", (receivedPayload) => {
    const { receiverId, content, senderContent, conversationId } =
      receivedPayload;
    console.log("[socket]: sendMessage: " + content);
    const senderId = users[socket.id]; //Get the sender id from the users object

    console.log(
      "[sendMessage]: senderId: " + senderId,
      "receiverId: " + receiverId
    );

    //Send the message to the receiver
    for (const socketId in users) {
      if (users[socketId] === receiverId) {
        console.log("[sendMessage ok] Private message to: " + receiverId);
        //Where we find the receiver socket id, we send the message
        socket.to(socket.id).to(socketId).emit("getMessage", {
          senderId,
          senderContent,
          content,
          conversationId,
        });
      }
    }
    // io.emit("sendMessage", `${socket.id} said ${msg}`);
  });

  socket.on("disconnect", () => handleDisconnectEvent(socket));
};

const handleDisconnectEvent = (socket: Socket) => {
  console.log(`user disconnect ${socket.id}`);

  //Remove the user from the users object
  removeUser(socket.id);

  console.log("[socket] users:", users);
};

const handleConnectEvent = (socket: Socket, io: SocketServer) => {
  //Verify and decode the JWT from the bearer header
  const token = verifyJWT(
    socket.handshake.headers.authorization?.split(" ")[1] || ""
  );

  if (token) {
    console.log(`user connected: ${socket.id} ${token.user.id}`);
    //   console.log("[handleConnectEvent]: ", token);

    //Store the user id and socket id in the users object
    addUser(socket.id, token.user.id);
    console.log("[socket] users:", users);
  } else {
    console.log("[socket]: unauthorized");

    io.emit("exception", {
      message: "Unauthorized",
    });

    socket.disconnect();
  }
};
