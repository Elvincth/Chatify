import "~/config/dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import http from "http";
import { connectToDb } from "~/utils/connectToDb";
import { Server } from "socket.io";
import routes from "~/routes";
import { configurePassport } from "~/config/passport";
import passport from "passport";
import { socketWrapper } from "./utils/socketWrapper";
import { handleSocketEvents } from "./socket";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  SocketServer,
} from "interfaces";

const app = express();
const port = process.env.PORT || 3001;
const server = http.createServer(app);

configurePassport(app);

const corsConfig = {
  credentials: true,
  origin: true,
};

app.use(cors(corsConfig));

app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use("/api/v1", routes); //Call api in e.g. http://localhost:3001/api/example
//use passport middleware for authentication in socket.io

//Here we connect to our mongo database
connectToDb().then(() => {
  console.log("Database connected");

  //Start the server
  server.listen(port, () => {
    console.log(`[server]: Server is running at https://localhost:${port}`);
  });
});

/**
 * Socket.io server setup
 */

const io = new Server<
  SocketData,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents
>(server, {
  cookie: true,
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.use(socketWrapper(passport.initialize()));

//Where here we protect our socket.io routes, we add a JWT middleware
//Actually, we could use our own socketAuthMiddleware, it is the same
io.use(socketWrapper(passport.authenticate("jwt", { session: false })));

// //Where here we protect our socket.io routes
// io.use(socketAuthMiddleware);

io.on("connection", (socket) => handleSocketEvents(socket, io));

export default server;
