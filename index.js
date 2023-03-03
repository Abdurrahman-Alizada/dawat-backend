import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from 'http'
import WebSocket, {WebSocketServer} from 'ws';
import {Server} from "socket.io";
import userRouter from "./router/userRouter.js";
import groupRouter from './router/groupRouter.js';
import messageRoutes from './router/messageRoutes.js';
import invitationRouter from './router/invitationRouter.js';
import taskRouter from './router/taskRouter.js';
import FriendRouter from "./router/FriendshipRouter.js";
import TaskLogsRouter from "./router/TaskLogsRouter.js";

dotenv.config();

const app = express();
const server = http.createServer(app)

const port = process.env.PORT || 8000;

// db config
mongoose.connect(process.env.MONGO_URL, {
  autoIndex: true, //this is the code I added that solved it all
});

// for checking that database is connected or not
mongoose.connection.once("open", () => {
  console.log("Database is connected");
});

// middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// api routes
app.get("/", (req, res) => {
  res.status(200).send("Hello World from dawat backend");
});

app.use("/api/account", userRouter);
app.use("/api/group", groupRouter);
app.use("/api/group/message", messageRoutes);
app.use("/api/group/invitations", invitationRouter);
app.use("/api/group/tasks", taskRouter);
app.use("/api/friendship", FriendRouter);
app.use('/api/group/task/logs', TaskLogsRouter);

// listen
// app.listen(port, () => console.log(`Listening on local host ${port}`));
server.listen(port, () => console.log(`Listening on local host ${port}`));

//chat

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});


io.on("connection", (socket) => {
  // console.log("Sockets are in action");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(userData.name, "connected");
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room: " + room);
  });
  socket.on("new message", (newMessage) => {
    
    let chat = newMessage;

    if (!chat.group.users.length) return console.log("chat.users not defined");

    chat.group.users.forEach((user) => {
      if (user._id === newMessage.addedBy._id) return;
      socket.in(user._id).emit("message received", newMessage);
    });
    socket.on("typing", (room) => {
      socket.in(room).emit("typing");
    });
    socket.on("stop typing", (room) => {
      socket.in(room).emit("stop typing");
    });
  });
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

